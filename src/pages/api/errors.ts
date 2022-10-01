import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const handler: NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  res.statusCode = 403;
  res.end('Not available from your region.');
};

export default handler;
