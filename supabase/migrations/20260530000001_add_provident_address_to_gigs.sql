-- Add provident_address to gigs table for ERC-8183 style escrow address
ALTER TABLE gigs ADD COLUMN IF NOT EXISTS provident_address VARCHAR(42) DEFAULT '0x0000000000000000000000000000000000000000';
