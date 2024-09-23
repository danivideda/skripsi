import { bech32 } from 'bech32';

// helper function
export function truncate(str: string, separator = '...', length = 4): string {
  const first = str.substring(0, length);
  const second = str.substring(str.length - length, str.length);

  return first + separator + second;
}

export function bufferToHexString(
  buffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>,
): string {
  return Buffer.from(buffer).toString('hex');
}

function decodeBech32(encoded: string): string {
  // The 1023 characters limit is the recommended maximum length, as per the docs says: https://npm.io/package/bech32
  const decoded = bech32.decode(encoded, 1023);
  return Buffer.from(bech32.fromWords(decoded.words)).toString('hex');
}

export const destAddr: Map<string, string> = new Map([
  /** P1 --> D1 */
  [
    decodeBech32('stake_test1uzxudsaupme6ct88a04effazg0ecnkze37f596nfckx2gtcmpj899'),
    'addr_test1qrfd9txlnpnqgpfgwucpt04p0q82w9rn8wdrvlu9re99se4evxmmcjsc9hhhjdh78cd5ezzwhzz7avjzmvuxz0lu90mq687qhw',
  ],
  [
    decodeBech32('stake_test1urwa4wfjlt95jy40xu8v2y5jmlwe6gn33vt2xad8qmljvuctke7d3'),
    'addr_test1qqyyctvexsk8jy8r79sjzdt5drprnzaajym5c90dh0gwsqjlezt5z25ykjguct694ef4jr4snsk8uwsvcr64j26prufqusfqqq',
  ],
  [
    decodeBech32('stake_test1uptfem0nnnw3gs9h938je4kkjgat4p956p7aj7svk9nlxgslq0mz5'),
    'addr_test1qpnfeyxnlk0cquyfx88kzch45w6uvaqpn0cfcgwgdda3mmkx98jcgqm4k0ff3rm4p05g0xj0m8yxnww8se9c7wmpal3s3yqq7e',
  ],
  [
    decodeBech32('stake_test1uq4ay6maqap0x6rhtd85k9w8hfh5w9vedd9jjhm9dcc7k0g7e59xs'),
    'addr_test1qp4auakesmz5rv6a6pnk6qlrw5lv7gxtjx50hth4cx85fv033y77nwf0d45vd5ke84p508raqw3jtf5re8rewwk7u3psvcrl2s',
  ],
  [
    decodeBech32('stake_test1uqjqltxulpwxydw794sufn9dxj2lv8lxpy9c0jlxuhvn8sshu49ne'),
    'addr_test1qpnvwghq5envry6rc2vmhsv5xtx8lhd23zkdrmuyymz55fcnyhtepjwsy2atglwqwty46hdh5grpyewjcpusukgz7laqq6csgm',
  ],
  [
    decodeBech32('stake_test1upj6t77tcv7wwxudl3wnqsjusqcyvdrq3nh0xf95z0svtcgkg34vw'),
    'addr_test1qrwefdlt8chjwmxwu62k06hxcfylmrklu2jynhmgqdyc4xts4jafesu8x52sgtwgmnhdlruhrd8gw2jc9uqa77wdtlyqgdgr4u',
  ],

  /** P2 --> D2 */
  [
    decodeBech32('stake_test1uzq33tplu8sf4xw3fgyu99h6m57wv3mxeq9ypsu2kglq06sz6z575'),
    'addr_test1qz6d3whuwpahjyu9f9pz66a0vaklt8u8ls0c2nhvlm94uq4r4pnyzzhr4cfau5azechl38cqymsw4uhmpmze5cs2nw7q0f6jx7',
  ],
  [
    decodeBech32('stake_test1uq9mv9ftw45ar64u3nqhywpgjr6e3aqr6crhh99e4cxxlggct6l6q'),
    'addr_test1qr0khmt09ssn0pgmgkr4f7esyag94uvhukxu6hp9dwswjjy3ptjxumdjpz6h9ztzpjzdhdqt9e2w3he67evz0lk0wmjq2um80g',
  ],
  [
    decodeBech32('stake_test1uq83ka0hpcrvdljlpgfketxc6z8vr4dn6ljpg4kxmts8rjghf9gcv'),
    'addr_test1qz2kjtv6le9nx4cmwmyzm88vhnctx89rc8g5k88aqtzmttgh3t3tg8ycu005gsjmslc7k2q2ukyhzehykh82sd2qtgqsu3hg99',
  ],
  [
    decodeBech32('stake_test1upgg2h24gtmdw5pd0ql88hk6lwvdm90qf8d2av9q9qg7wrseajfpu'),
    'addr_test1qqpnnpw063vga77gms7xygtmfx659t6vcpvykmry7vald302z776n9ad7uldn03wla0en53n8ut2wpnfjy5awew4xgjsg7uuax',
  ],
  [
    decodeBech32('stake_test1uq0gj3qwfhnt6epe4v8vnga0frpx6zn4wtscpdmxdgc8vcc9hptte'),
    'addr_test1qpea8f09jwgy266mrnyh29xux47xq82ad4uv6yspntdexsqv2d4h307vn36kec3ta4828eyq07uzswcw9x96sn7nxklqew8r7m',
  ],
  [
    decodeBech32('stake_test1uzr4p2mv9eztj90z7mdg75yql8h0hw7cpeg3aelzkk8kzqsgvs5ja'),
    'addr_test1qqe8cl800rku3je79j2gdr3462ge9g6ez8zgnz7cslyqy5xshhq3ruvdk25wjsgaaeq8dnhrjn2u3nn6cv97hc4apdvq226xy7',
  ],

  /** P3 --> D3 */
  [
    decodeBech32('stake_test1uq7ekljzlhasara79lhg09nqv4vs2ghre6y9vvzj8hj7jpsdxa7cx'),
    'addr_test1qqrku8tj00m54ekw8ategkdja2gyatvyt3zhy5yqfz59lfrps06z2jnek5m7xe5dcdw2c3m8vgurlazfkl0vrdal5fnq93xm9r',
  ],
  [
    decodeBech32('stake_test1uzc8lje3t4wu3pzdpmvmukd4wqry4zu0e7tw8genatpp5qsw5y76c'),
    'addr_test1qregu678ru5tfarg0v6y0qa6lh8axujttrcnf86m9gg85wrx94xzqvq4gh6mn5lfk6c02l52ljdltkuy7avvyy9l598st000pq',
  ],
  [
    decodeBech32('stake_test1uq5exn0sflm6n9dea4xcxte5ets2u5fp0ms3lpe7hg7et7cm64cua'),
    'addr_test1qrhknl3ad8gzxamqrqfh36t645el0dc8fw868wwr3qca56562wj88ezu6kmvlcjmtxuz5yw690vn6nayvgrq7x8gnr9su3thty',
  ],
  [
    decodeBech32('stake_test1ur24hcfzxnp2wwuaydxtt6ge73tpdj63ltzwjd62eyjyv3skhgyjy'),
    'addr_test1qr87utzuph4wzh0a26aad0c56x6hwh0pwm64eapqxz5gcj2a55gn8f4xl6dsuc6z23zj9a87y82vef462q90gqxlrveq66d3z2',
  ],
  [
    decodeBech32('stake_test1urkeu305ljzh3m4vtgtx9rv4s67hl4exkjqdcnnngxvmkys6gjmsn'),
    'addr_test1qztaje9zj7lgpmfn736qlfturw3zx0xgnal4wvpau6uer9n5p5jc5xu6pzajhu8eucczp08qn2appjdz87jwuj3xw2usy4k6zv',
  ],
  [
    decodeBech32('stake_test1uzm7rt9nnrxvcscx3hdxtajkjp57ss9w56a0f940nshsddqznfmmu'),
    'addr_test1qq207alpmdkpla5p7lf7jlruudpwfu38yalgvtwvcq636wk3xxdnqlr5n24slp4reekrgvanvur3xckqms5wn2krw29quvmpz2',
  ],

  /** P4 --> D4 */
  [
    decodeBech32('stake_test1uzxyee0e9w8m5vpea0t72z9hdpta3up6xefcxad3k7qjnsc3c9m33'),
    'addr_test1qr7k0ep0nkp33rjhtl02nssyfgcdqe4cxn625e7v5ukrx9l5p55l460zfpacuxnutgjlnhe84ssnfmltr6mzh4ms80jsnszwcu',
  ],
  [
    decodeBech32('stake_test1urchl0mq57vltqj0vnq3t00wjgynh9rspalfgr5hgfv8yec4pxggn'),
    'addr_test1qpxlntqwpmq5pp3epjhuxynpf3966na07s9wklz8g9t7j844el9spyqrh4el2874wufxgupg530yd2j6eq7x9nyhtf2sl7q89z',
  ],
  [
    decodeBech32('stake_test1urmv8t2zav0xl9k935jwmtllc6r536wx5ac2uegzshtgkys3cns3f'),
    'addr_test1qpfhc3438ndxg33wnyvpdszc5kmr3xxt3ytk3ttc9t0c97n6k0h33n5cghrup58dkhlpzuztq9w4xfqg8hwcveee3jusn6dhsx',
  ],
  [
    decodeBech32('stake_test1uqmyw6v66905tehw8p7uh2mcuagce7ezxfvqk32wv3g7sjg255g9k'),
    'addr_test1qq94wx4f6at7qmhnt7qrwnr049rkke5sja3xege5z7x932c9h4pegl0nyg8dtf22upmjsj37st8kkvv0pv4rn3shp97s2r5thz',
  ],
  [
    decodeBech32('stake_test1ur8lderunzvjkkdtu6p9n9lp89tcar9xtutwy55e5mr385cjju6tp'),
    'addr_test1qq3w52rw03ecxtu73ynnvrs3freept7vzrycsm5vgccunvc8v3w6kxgt6wp2y669gr0uln3v0y8xqscav5a77fhepvps5qqfag',
  ],
  [
    decodeBech32('stake_test1uqucq5r4qcq2dwefv47rka3f7nl80dm5h8xjzwa8enj68lq9yvhev'),
    'addr_test1qpp9mpekdllkw0vzm663c9f643x9mjj69yc30r4wpklsac2aggacjcmsld6rjz2mjzvqxsjta87j928zz6cl6zvt0f9qzh06u2',
  ],

  /** P5 --> D5 */
  [
    decodeBech32('stake_test1urm9e3s2anmm2v9hlut5d4nzxwaq05r8hhf63w4a38e486gqxcjmc'),
    '',
  ],
  [
    decodeBech32('stake_test1uzrxkxcndntqa9hl4jpnr0wt99fmnqqwdzm0hqr5cgxlsygyzpnr5'),
    '',
  ],
  [
    decodeBech32('stake_test1uq3xpdlhz7axqwtepgdzsemzdjr7000c4k5r2lp70kgwppczx3dfe'),
    '',
  ],
  [
    decodeBech32('stake_test1uqspj0v0nyhvd6nq3ey7sx3cmyy7hk5qmjy2r4de9tmtlgcjm9c0y'),
    '',
  ],
  [
    decodeBech32('stake_test1upasltllrmet4g0ljku2d475yqvtl6amx592hn0e4fhufvgw8jl27'),
    '',
  ],
  [
    decodeBech32('stake_test1uzrc9n5fv4w80wk08qked5rhrcd02fag5xhf50y2rlw3eychkdf2n'),
    '',
  ],

  /** P6 --> D6 */
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],

  /** P7 --> D7 */
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],

  /** P8 --> D8 */
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],

  /** P9 --> D9 */
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],

  /** P10 --> D10 */
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
  [
    decodeBech32(''),
    '',
  ],
]);
