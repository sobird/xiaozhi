import { NextRequest } from 'next/server';
import { POST } from './route';

const textXml = `<xml>
    <ToUserName><![CDATA[gh_dbb9c22f60fa]]></ToUserName>
    <FromUserName><![CDATA[oQd-2wDy6wdylqtDC_pOZwZy-CGI]]></FromUserName>
    <CreateTime>1740421000</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[你好啊]]></Content>
    <MsgId>24916839309634085</MsgId>
    <Encrypt><![CDATA[RllNFN+f8ig1PqvI/AYB39TC0/hZqIQUlmlZ8KhbxBGW0baGuVVxIh04X/tv1a2EQfWvbLM0biJM2C9/AaM/l+EXTKLcGxB/WxLmW3PVZH0jXiXuO3UKNGCMDvx8Y/5Xuk81XSEZnBngeQnR65d5pvTz2CJAv+GtAPeDIrR/yPgnixkmXNHND+vfQ8qflw8gCV8OnDB6BX4t17upEeieI54ccVwZgcLJxjngvUW7d83J+1JYs+glDax7c7aCi2MvzUUx4nJ9HGZINZwIgpFZljlKDLNffnLeTNBZldWZXmJJLyPMXVVmuJw7eXMrWv/MvAwZ4a0J2NhiT4Bpko6yJ2ybYB+oRtCeVoHmF9G+Ls+5VssEdD8UteXKGljatWZiBRfVFtc7yq+i0tDRgQTTq0OiAblZBAzKaouXHmzHbAg=]]></Encrypt>
</xml>`;

const imageXml = `<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[fromUser]]></FromUserName>
  <CreateTime>12345678</CreateTime>
  <MsgType><![CDATA[image]]></MsgType>
  <Image>
    <MediaId><![CDATA[media_id]]></MediaId>
  </Image>
</xml>`;

const request = new NextRequest('http://localhost/api/wechat', {
  method: 'POST',
  body: imageXml,
});

const response = await POST(request);
console.log('response', response);
