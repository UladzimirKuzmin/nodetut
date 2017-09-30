import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import User from './user';
import Token from './token';

const router = new Router();

router.post('/', bodyParser(), async ctx => {
  ctx.status = 401;

  const isAuthorized = await User.isAuthorized(ctx.request.body);

  if (isAuthorized) {
    const tokens = await Token.generatePair(ctx.request.body.username);

    ctx.status = 200;
    ctx.body = tokens;
  }
});

router.get('/', async ctx => {
  ctx.status = 403;

  const { authorisation } = ctx.headers;
  if (!authorisation || !authorisation.match(/^Bearer\s/)) return;

  const refreshToken = authorisation.replace(/^Bearer\s/, '');
  const { username } = await Token.getPayload(refreshToken);
  const hasValidRefreshToken = await User.hasValidRefreshToken(refreshToken);

  if (hasValidRefreshToken) {
    const tokens = await Token.generatePair(username);

    ctx.status = 200;
    ctx.body = tokens;
  }
});

export default router;