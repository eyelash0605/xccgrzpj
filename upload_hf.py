# -*- coding: utf-8 -*-
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client

secret_id = 'AKIDjLSN3d3QeeR9h3B4tWvZzDE4i8LL7ex2'
secret_key = 'tZ0DDzWoslSxEH6h3CJHC3lJgplTzIMB'
region = 'ap-guangzhou'
bucket = 'grjltp-1305447954'

config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
client = CosS3Client(config)

with open(r'f:\个人简历网页搭建\个人简历网站\zyk\wy\hf.png', 'rb') as f:
    client.put_object(Bucket=bucket, Body=f, Key='zyk/wy/hf.png')
print('[OK] hf.png uploaded')
