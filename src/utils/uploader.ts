import { baseURL } from '@/utils/config';
import storage from '@/utils/storage';
import $ from 'jquery';
import WebUploader from 'webuploader';

function createUploader(option?: any) {
  const filesChunkNum = {};
  WebUploader.Uploader.register(
    {
      'before-send-file': 'preupload',
      'before-send': 'checkchunk',
    },
    { preupload, checkchunk }
  );

  const uploader = new WebUploader.Uploader({
    server: `${baseURL}/document/upload_piece`,
    chunked: true,
    chunkSize: 512 * 1024,
    auto: true,
    compress: false,
    ...option,
  });

  uploader.on('uploadBeforeSend', (block, data, headers) => {
    data.hash = block.file.hash;
    data.chunk_hash = block.chunk_hash;
    headers['x-user-token'] = storage.cookie.get('token');
  });

  function preupload(file) {
    const deferred = WebUploader.Deferred();
    const owner = this.owner;
    owner
      .md5File(file.source)
      .then(md5 => {
        // 获取 md5 成功后执行
        // 将计算出来的 md5 值，挂载在文件属性上（为后面做铺垫）
        file.hash = md5;
        // 服务端验证是否存在该文件
        $.ajax({
          type: 'get',
          url: `${baseURL}/document/list_exist`,
          data: { hash: md5 },
          headers: {
            'x-user-token': storage.cookie.get('token'),
          },
          success({ success, data }) {
            // 服务器校验成功
            if (success) {
              // owner.skipFile(file);
              filesChunkNum[md5] = data.chunks;
              console.log('文件重复，已跳过');
            }

            deferred.resolve();
          },
        });
      })
      .fail(() => {
        console.log('MD5 计算失败');
        deferred.reject();
      });

    return deferred.promise();
  }

  function checkchunk(block) {
    const deferred = WebUploader.Deferred();
    if (
      filesChunkNum[block.file.hash] &&
      filesChunkNum[block.file.hash].some(item => block.chunk.toString() === item)
    ) {
      deferred.reject();
    } else {
      deferred.resolve();
    }

    return deferred.promise();
  }

  return uploader;
}

export default createUploader;
