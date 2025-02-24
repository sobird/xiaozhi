import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { parseStringPromise, Builder } from 'xml2js';

// process.env.WECHAT_TOKEN
const WECHAT_TOKEN = '';

function checkSignature(signature: string | null, timestamp: string | null, nonce: string | null) {
  const arr = [WECHAT_TOKEN, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

export const GET = (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  // console.log('req', req.nextUrl.searchParams);
  const signature = searchParams.get('signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  if (!signature || !timestamp || !nonce || !echostr) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const result = checkSignature(signature, timestamp, nonce);

  if (result) {
    return new NextResponse(echostr);
  }

  return new NextResponse('Invalid signature', { status: 403 });
};

// POST 请求处理（接收消息）
export async function POST(request: NextRequest) {
  const xml = await request.text();
  const message = (await parseStringPromise(xml)).xml;

  const msgType = message.MsgType[0];
  const fromUser = message.FromUserName[0];
  const toUser = message.ToUserName[0];

  const builder = new Builder({ rootName: 'xml', cdata: true });

  const reply: Record<string, string | number | []> = {
    ToUserName: fromUser,
    FromUserName: toUser,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: msgType,
  };
  switch (msgType) {
    case 'text':
      reply.Content = `已收到：${message.Content[0]}`;
      break;
    case 'image':
      reply.Image = [{ MediaId: message.MediaId[0] }];
      break;
    case 'voice':
      reply.Voice = [{ MediaId: message.MediaId[0] }];
      break;
    case 'video':
      reply.Video = [{ MediaId: message.MediaId[0] }];
      break;
    default:
  }

  const replyXml = builder.buildObject(reply);

  return new NextResponse(replyXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
