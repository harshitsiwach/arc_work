// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BountyEscrow
 * @notice Manages bounty creation, submission, approval, and USDC escrow on Arc Testnet.
 */
contract BountyEscrow is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public immutable usdc;

    enum WorkerType { HUMAN, AGENT, BOTH }
    enum BountyStatus { OPEN, FUNDED, SUBMITTED, COMPLETED, REFUNDED, DISPUTED }

    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 reward;
        uint256 deadline;
        WorkerType workerType;
        BountyStatus status;
        address winner;
        uint256 submissionCount;
    }

    struct Submission {
        uint256 id;
        uint256 bountyId;
        address submitter;
        bytes32 proofHash;
        uint256 submittedAt;
        bool isApproved;
    }

    uint256 public nextBountyId;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) public bountySubmissions;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline,
        WorkerType workerType
    );
    event WorkSubmitted(uint256 indexed bountyId, uint256 indexed submissionId, address indexed submitter, bytes32 proofHash);
    event SubmissionApproved(uint256 indexed bountyId, uint256 indexed submissionId, address indexed winner);
    event SubmissionRejected(uint256 indexed bountyId, uint256 indexed submissionId);
    event BountyCompleted(uint256 indexed bountyId, address indexed winner, uint256 reward);
    event BountyRefunded(uint256 indexed bountyId, address indexed creator, uint256 reward);
    event DisputeRaised(uint256 indexed bountyId, address indexed raiser);

    error BountyNotFound();
    error InvalidStatus();
    error DeadlineNotPassed();
    error DeadlinePassed();
    error AlreadyCompleted();
    error NotCreatorOrSubmitter();
    error InvalidReward();
    error InvalidDeadline();

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }

    function createBounty(
        string calldata title,
        string calldata description,
        uint256 reward,
        uint256 deadline,
        WorkerType workerType
    ) external nonReentrant whenNotPaused returns (uint256) {
        if (reward == 0) revert InvalidReward();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        usdc.safeTransferFrom(msg.sender, address(this), reward);

        uint256 bountyId = nextBountyId++;
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            title: title,
            description: description,
            reward: reward,
            deadline: deadline,
            workerType: workerType,
            status: BountyStatus.FUNDED,
            winner: address(0),
            submissionCount: 0
        });

        emit BountyCreated(bountyId, msg.sender, title, reward, deadline, workerType);
        return bountyId;
    }

    function submitWork(uint256 bountyId, bytes32 proofHash) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
        if (bounty.status != BountyStatus.FUNDED && bounty.status != BountyStatus.SUBMITTED) revert InvalidStatus();
        if (block.timestamp > bounty.deadline) revert DeadlinePassed();

        uint256 submissionId = bounty.submissionCount;
        bountySubmissions[bountyId].push(Submission({
            id: submissionId,
            bountyId: bountyId,
            submitter: msg.sender,
            proofHash: proofHash,
            submittedAt: block.timestamp,
            isApproved: false
        }));
        bounty.submissionCount++;
        bounty.status = BountyStatus.SUBMITTED;

        emit WorkSubmitted(bountyId, submissionId, msg.sender, proofHash);
    }

    function approveSubmission(uint256 bountyId, uint256 submissionId) external nonReentrant onlyRole(MODERATOR_ROLE) {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
        if (bounty.status == BountyStatus.COMPLETED || bounty.status == BountyStatus.REFUNDED) revert AlreadyCompleted();

        Submission storage sub = bountySubmissions[bountyId][submissionId];
        sub.isApproved = true;
        bounty.winner = sub.submitter;
        bounty.status = BountyStatus.COMPLETED;

        usdc.safeTransfer(sub.submitter, bounty.reward);

        emit SubmissionApproved(bountyId, submissionId, sub.submitter);
        emit BountyCompleted(bountyId, sub.submitter, bounty.reward);
    }

    function rejectSubmission(uint256 bountyId, uint256 submissionId) external nonReentrant onlyRole(MODERATOR_ROLE) {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
        if (bounty.status == BountyStatus.COMPLETED || bounty.status == BountyStatus.REFUNDED) revert AlreadyCompleted();

        emit SubmissionRejected(bountyId, submissionId);
    }

    function refundCreator(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
        if (bounty.status == BountyStatus.COMPLETED || bounty.status == BountyStatus.REFUNDED) revert AlreadyCompleted();
        if (block.timestamp <= bounty.deadline) revert DeadlineNotPassed();

        bounty.status = BountyStatus.REFUNDED;
        usdc.safeTransfer(bounty.creator, bounty.reward);

        emit BountyRefunded(bountyId, bounty.creator, bounty.reward);
    }

    function raiseDispute(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
        if (bounty.status == BountyStatus.COMPLETED || bounty.status == BountyStatus.REFUNDED) revert AlreadyCompleted();

        bool isCreator = msg.sender == bounty.creator;
        bool isSubmitter = false;
        for (uint256 i = 0; i < bounty.submissionCount; i++) {
            if (bountySubmissions[bountyId][i].submitter == msg.sender) {
                isSubmitter = true;
                break;
            }
        }
        if (!isCreator && !isSubmitter) revert NotCreatorOrSubmitter();

        bounty.status = BountyStatus.DISPUTED;
        emit DisputeRaised(bountyId, msg.sender);
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }

    function getAllBounties() external view returns (Bounty[] memory) {
        Bounty[] memory allBounties = new Bounty[](nextBountyId);
        for (uint256 i = 0; i < nextBountyId; i++) {
            allBounties[i] = bounties[i];
        }
        return allBounties;
    }

    function getSubmissions(uint256 bountyId) external view returns (Submission[] memory) {
        return bountySubmissions[bountyId];
    }

    function hasRoleAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
