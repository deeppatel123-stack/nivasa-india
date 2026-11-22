export function notFoundHandler(req, res) {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  res.status(404).send('Not found');
}

export function errorHandler(error, _req, res, _next) {
  console.error('[api]', error);
  const status = Number(error.status) || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
  });
}
