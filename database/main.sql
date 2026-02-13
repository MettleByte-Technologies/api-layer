CREATE DATABASE IntegrationApi;
Use IntegrationApi;

CREATE TABLE connected_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Internal user reference from your main backend
  user_id VARCHAR(100) NOT NULL,
  
  -- Provider name (google, outlook, hubspot)
  provider VARCHAR(50) NOT NULL,
  
  -- External account ID (Google account email or ID)
  external_account_id VARCHAR(255),

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50),
  scope TEXT,
  
  -- Expiry timestamp (store as BIGINT from Google expiry_date)
  expiry_date BIGINT,

  -- Status (connected / revoked / expired)
  status VARCHAR(50) DEFAULT 'connected',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_provider (user_id, provider)
);

CREATE TABLE integration_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(100),
  provider VARCHAR(50),
  action VARCHAR(100),

  request_payload JSON,
  response_payload JSON,

  status VARCHAR(50), -- success / failed
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);