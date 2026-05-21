// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ERC8191 Subscription Controller
 * @notice Implements standard recurring payment channels for creators and members using USDC.
 */
contract SubscriptionController {
    enum SubscriptionStatus { Inactive, Active, PastDue, Cancelled }

    struct Subscription {
        uint256 id;
        address subscriber;
        address creator;
        IERC20 token;
        uint256 amount;
        uint256 billingInterval; // in seconds
        uint256 nextBillingTime;
        SubscriptionStatus status;
    }

    uint256 public nextSubscriptionId;
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256[]) public subscriberSubscriptions;
    mapping(address => uint256[]) public creatorSubscriptions;

    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed creator,
        address token,
        uint256 amount,
        uint256 billingInterval
    );
    event SubscriptionBilled(uint256 indexed subscriptionId, uint256 amount, uint256 billingTime);
    event SubscriptionStatusChanged(uint256 indexed subscriptionId, SubscriptionStatus status);

    error InvalidInterval();
    error InvalidAmount();
    error SubscriptionNotActive();
    error BillingNotDue();
    error Unauthorized();
    error TransferFailed();

    /**
     * @notice Create a subscription to a creator's tier.
     * @param creator The address of the creator to subscribe to.
     * @param token The ERC20 token address (e.g., USDC).
     * @param amount The recurring billing amount per interval.
     * @param billingInterval The duration of each billing cycle in seconds.
     */
    function subscribe(
        address creator,
        address token,
        uint256 amount,
        uint256 billingInterval
    ) external returns (uint256) {
        if (billingInterval == 0) revert InvalidInterval();
        if (amount == 0) revert InvalidAmount();
        if (creator == address(0)) revert Unauthorized();

        uint256 subscriptionId = nextSubscriptionId++;
        
        Subscription memory newSub = Subscription({
            id: subscriptionId,
            subscriber: msg.sender,
            creator: creator,
            token: IERC20(token),
            amount: amount,
            billingInterval: billingInterval,
            nextBillingTime: block.timestamp, // First charge can be executed immediately
            status: SubscriptionStatus.Active
        });

        subscriptions[subscriptionId] = newSub;
        subscriberSubscriptions[msg.sender].push(subscriptionId);
        creatorSubscriptions[creator].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            creator,
            token,
            amount,
            billingInterval
        );

        return subscriptionId;
    }

    /**
     * @notice Executes billing for a subscription. Can only be called by the creator or contract executor.
     * @param subscriptionId The subscription to charge.
     */
    function executeBilling(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        if (sub.status != SubscriptionStatus.Active && sub.status != SubscriptionStatus.PastDue) {
            revert SubscriptionNotActive();
        }
        if (block.timestamp < sub.nextBillingTime) {
            revert BillingNotDue();
        }

        // Pull tokens from the subscriber and send to the creator
        bool success = sub.token.transferFrom(sub.subscriber, sub.creator, sub.amount);
        if (!success) {
            sub.status = SubscriptionStatus.PastDue;
            emit SubscriptionStatusChanged(subscriptionId, SubscriptionStatus.PastDue);
            revert TransferFailed();
        }

        sub.nextBillingTime = block.timestamp + sub.billingInterval;
        sub.status = SubscriptionStatus.Active;

        emit SubscriptionBilled(subscriptionId, sub.amount, block.timestamp);
    }

    /**
     * @notice Cancels an active subscription. Callable by either subscriber or creator.
     * @param subscriptionId The subscription to cancel.
     */
    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        if (msg.sender != sub.subscriber && msg.sender != sub.creator) {
            revert Unauthorized();
        }

        sub.status = SubscriptionStatus.Cancelled;
        emit SubscriptionStatusChanged(subscriptionId, SubscriptionStatus.Cancelled);
    }

    /**
     * @notice Get all subscription IDs for a subscriber.
     */
    function getSubscriberSubscriptions(address subscriber) external view returns (uint256[] memory) {
        return subscriberSubscriptions[subscriber];
    }

    /**
     * @notice Get all subscription IDs for a creator.
     */
    function getCreatorSubscriptions(address creator) external view returns (uint256[] memory) {
        return creatorSubscriptions[creator];
    }
}
