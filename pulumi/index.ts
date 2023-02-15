import * as pulumi from "@pulumi/pulumi";
import * as sakuracloud from '@sacloud/pulumi_sakuracloud';
import * as fs from "fs";

const env = pulumi.getStack();
const prefix = 'sample-' + env + '-';

// ディスクイメージのIDを取得
const ubuntu18archive = pulumi.output(sakuracloud.getArchive({
    filter: {
        tags: ['ubuntu-18.04-latest'],
    },
}));

// 20GBのSSDを作成
const disk = new sakuracloud.Disk(prefix + 'disk', {
    plan: 'ssd',
    size: 20,
    sourceArchiveId: ubuntu18archive.id,
});

// SSH鍵を登録
const publicKey = fs.readFileSync("./id_rsa.pub").toString();
const sshKey = new sakuracloud.SSHKey(prefix + 'ssh_key', {
    publicKey: publicKey,
});

// サーバを作成
const server = new sakuracloud.Server(prefix + 'server', {
    disks: [disk.id],
    networkInterfaces: [{
        upstream: 'shared',
    }],
    diskEditParameter: {
        sshKeyIds: [sshKey.id],
    },
});

// Output
export const serverID = server.id;
export const diskID = disk.id;
