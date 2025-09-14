import { Hono } from 'hono';
import { share } from '@/main/server/controller/share';

export default function buildRouter() {
  const app = new Hono();
  app.route('/share', share);
  return app;
}
