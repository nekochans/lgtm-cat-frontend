import type { NextApiRequest, NextApiResponse } from 'next';

export const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.statusCode = 403;
  res.end('Not available from your region.');
};

export default handler;
