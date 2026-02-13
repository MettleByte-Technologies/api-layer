import { db } from "../config/database";

export const saveConnectedAccount = async (
  userId: string,
  provider: string,
  tokens: any,
  externalAccountId?: string
) => {
  const query = `
    INSERT INTO connected_accounts 
    (user_id, provider, external_account_id, access_token, refresh_token, expiry_date, scope)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      access_token = VALUES(access_token),
      refresh_token = VALUES(refresh_token),
      expiry_date = VALUES(expiry_date),
      scope = VALUES(scope)
  `;

  await db.execute(query, [
    userId,
    provider,
    externalAccountId || null,
    tokens.access_token,
    tokens.refresh_token || null,
    tokens.expiry_date || null,
    tokens.scope || null,
  ]);
};

export const getConnectedAccount = async (
  userId: string,
  provider: string
) => {
  const [rows]: any = await db.execute(
    `SELECT * FROM connected_accounts WHERE user_id = ? AND provider = ?`,
    [userId, provider]
  );

  return rows[0];
};

export const updateTokens = async (
  id: number,
  tokens: any
) => {
  await db.execute(
    `UPDATE connected_accounts 
     SET access_token=?, refresh_token=?, expiry_date=? 
     WHERE id=?`,
    [
      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date,
      id,
    ]
  );
};