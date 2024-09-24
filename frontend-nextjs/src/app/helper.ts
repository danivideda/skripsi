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
    'addr_test1qp97k35ynd93g5wn584h6lzhhgzf5qg5tj3vssmllxfyqdzflwn0t4avy0wlld07r643chg6wurqdjunpjmgzm6tmnpq3lag4c',
  ],
  [
    decodeBech32('stake_test1uzrxkxcndntqa9hl4jpnr0wt99fmnqqwdzm0hqr5cgxlsygyzpnr5'),
    'addr_test1qp37n4jr6a2s4xazxe4ze0vuhqyrl6qaz8ppxl06pr55fgyd95df7ay30x2jvx4hrqyz9kmse8cpvkjkv2y3yu7tlrds0v3rle',
  ],
  [
    decodeBech32('stake_test1uq3xpdlhz7axqwtepgdzsemzdjr7000c4k5r2lp70kgwppczx3dfe'),
    'addr_test1qzk5twvk6hnf3d2pwk8kqeksaermhes5s2pz0lp053jj477qpa0jacjcrqd2qme8pxjqs9nq4k3a2z7nye2a3zfzt3yq0r3w2x',
  ],
  [
    decodeBech32('stake_test1uqspj0v0nyhvd6nq3ey7sx3cmyy7hk5qmjy2r4de9tmtlgcjm9c0y'),
    'addr_test1qqgd6vsdmy2g8a0jasgrlujs5wmw27ejlvvqqftvlv422pwgyuqpkftpjtaqx6n23x70crksysqhgznnlqw03ag2rc9szeamrm',
  ],
  [
    decodeBech32('stake_test1upasltllrmet4g0ljku2d475yqvtl6amx592hn0e4fhufvgw8jl27'),
    'addr_test1qpcmpx025m7c8kdlk8dauu5dphhz6k7scu6zud5fuepfcdmlj2ner9k3t9ea4zhnku8panugk2ee85ma67sq2kvcd6jsrnc6kj',
  ],
  [
    decodeBech32('stake_test1uzrc9n5fv4w80wk08qked5rhrcd02fag5xhf50y2rlw3eychkdf2n'),
    'addr_test1qz78wxrm7cg9fp0t88zlnzvgny6c0a20uaf9wjp798qczfg88nmz3z0gs42tda0uy3xuctaeze2zrtkmts5pgsd2u6hs3027q6',
  ],

  /** P6 --> D6 */
  [
    decodeBech32('stake_test1up2yercnvy8fu75xdeqhf42s6z5a3zq8y748zkyh8pcvadqkltlll'),
    'addr_test1qp57f0fqqywnkftyz8fnjxlgkccx3dewqsnjdqgaan60a54nfw4ulklct0xmlfgqug2e6husfcqjl339dxefncqwxgysltn28y',
  ],
  [
    decodeBech32('stake_test1upd0ez8pffxn48dcsn6zs24suh502rsr3083ntc4ma2pqrq6wwzz5'),
    'addr_test1qqqwe893m85wun3aukp7yxq6r36v8psppjccdrvze4unsl5yge97zfe9fsd3lzn37ggnujesdanrw9vwd686c3hv5maqg30zd2',
  ],
  [
    decodeBech32('stake_test1up9ghq5qqeg9yd904vr08z7eqm0jx0janc5zvmprj73d0eghs7t22'),
    'addr_test1qrd9xnp0n2d873y79jr02dv9pp49yj8sm3ean0dsx5wxclphucu86wadw6sfq40catf7flqfjgwzfk44cwy48trefmfq6rxj47',
  ],
  [
    decodeBech32('stake_test1uqswj04cwfgxdpl7mwfdzr6wjgxlcgf9ege2gwjnz6akaksyfwstj'),
    'addr_test1qzwt36uz497lhxvrh5l42m3flm2262460kva58kffdfhlh9c70lwvqg8g45ansze3f4nms5zh0xy0x4l8sj8s8hqscqqjpetkw',
  ],
  [
    decodeBech32('stake_test1uzj8zykrtj3rtzzlma0z3y0cyfth9hlm868alua5aqcvjgsmq3399'),
    'addr_test1qpw3necfqdm4d4mggq65nrry3k4d5gs2ckxw4q5y5pncsdrzx39jt5uxn27lxvawyy0wwdkvvv64u5vk2y5mr225h37s0ek3cm',
  ],
  [
    decodeBech32('stake_test1ure8ccukhn2t8tk4jglxmvsjlqc7u49eevpckhq08mylrrqd78n9h'),
    'addr_test1qp3equt9yc667tqgg5vzx94prmrfl6zlfpjgurdlvw6xj0zpu9ehrp9wpfxhn7dur04arzaat7lze3hhzxerqv0lkp8q2h6h3c',
  ],

  /** P7 --> D7 */
  [
    decodeBech32('stake_test1uqhcsey37trxzz382qqj3rlr8wyq3rneq5xxrqz9dra749csf2q2f'),
    'addr_test1qqganlnqdgzcqkt47h29cvvkqxxz68pywhrgh99mgypfd275gr9628ksd6qxc0u806324dauxwjg3tnzjj459cj3qw3q3dry32',
  ],
  [
    decodeBech32('stake_test1uzme502xg6lnr36zhlvsx2hdhh5jdpln4yr5y0x9qyjtqyc8pq382'),
    'addr_test1qrzwyxe9pc4xpke7nhgktxef57ea8v7cg78f8x5kts8sqteme526yswp3ekky4403yhxlqvxawygqwuzr22fhekrddhqmz7enu',
  ],
  [
    decodeBech32('stake_test1urmhfgshxm039tuyevl06mvvat378mnpeyzv4v9xrx04reslceu8d'),
    'addr_test1qr7tznhvgdmy2drg3y0rkkvgdm44wh7zc04v2ycp7s3n0nh097y56hnkjukkacd3j07fxyju7wp5wvha24v75v0nxnxqvyuszk',
  ],
  [
    decodeBech32('stake_test1urjynlaupavy44ckfznsufl5h5j7qjqfqjuwfhxcywnuyhqfaa30q'),
    'addr_test1qr7v88ylrgzhxzqmc3ya32p5ssprf9hfmnm8t7pxk4mar5ntq0v56yqvt30dudyjq2ra3kh6dsqdprmggdzlq2c2wk2s7zz0gh',
  ],
  [
    decodeBech32('stake_test1uqg64ptshmgug42a6fs2hnypnxgx9d4wkp8lgq8ara4l05s33g2k0'),
    'addr_test1qpdyd2d05zu0l2zgnpzs59zdarpveq8a82rm6g2jjwclqtal498v2c00tfjaphq4j5cmdp3jnh376qd8kc57g64zz3lqsscrav',
  ],
  [
    decodeBech32('stake_test1uzhv0xp4ncw80hj5xyaht2t93q8detx6prpen6f6q7gthssn2msp6'),
    'addr_test1qqjfxafudxu7v099alcc3wrlcmlj60ulqfmcjlqwtsucwajq30gyl9yju6qgu2aap7x0uj7rwt8fzt0qrax0g3j0ceascv5tfm',
  ],

  /** P8 --> D8 */
  [
    decodeBech32('stake_test1uz4f5efu9e8862kvphk22sgj658gsz8dxh4tzhm89dnxdjq9c90rc'),
    'addr_test1qz6jrl7e0uc0psq54chjswjppdlsj9c6wt6uerv084g2zdrjw8xkc3xmzqty930lcyjjj7kymh50q4ft33ujukh7lv2s9t3yxq',
  ],
  [
    decodeBech32('stake_test1up0ff48y8rf4qz8xzhk95nyre3xcswe7s4hhq4duldxtp5cwepp7p'),
    'addr_test1qqu65kwtamm3kvklsnqzn2dwyzctvyak6y3ytwf53zl9cn4an29nu8rtypnkq3et0t7edd96f2slmpvz2j35aywn2p7smam8up',
  ],
  [
    decodeBech32('stake_test1urhv8665mq8nyd93stgmgws5xe4mcr9n9lecpjyse8gpu0st02a5n'),
    'addr_test1qptkut3l40lya8plrrh5g0xae6vndp2kctdfs8r3supzp5an6mq5gvpcj9xyr6ga2ed85wtwpxl94e74ps6s9klclm3q779wfj',
  ],
  [
    decodeBech32('stake_test1uprr7qeynaawjt4cz2sdkpqlm8qyunu3k0l6z3fpn374xdg2g5qkj'),
    'addr_test1qrxg9x8evt83qte6vvse22k4kmnrv0868rkv53nhhfrdpp64z2frlznuyecujf58k3n3jq2c0wxjdg7kcua3ut3g2paq406hf9',
  ],
  [
    decodeBech32('stake_test1uq8wxce9e29hte8t3f872tupalcqsc95mvggwnmrln5rzhg0etv96'),
    'addr_test1qqzn4w49xp33vmtngy8uvvmkdt4tw98x4c6n9cnyshwm5cczvm2n908c2wwtseclnx4z6sc4j5mu8skp0pun5jcewkfsvu2mz5',
  ],
  [
    decodeBech32('stake_test1uquqec6wcg6sfgupzpttvfyh2t9pr0eelpgflpxunmeu58g3wzpzw'),
    'addr_test1qzdfrqs2twgcsjm3vnxt25wtd0lvcmmwhhakm4t8k0kf595epy60j5vep3ghknyzgh3sw4axv4g4y80s9wsq8yarw2wsrtfq6p',
  ],

  /** P9 --> D9 */
  [
    decodeBech32('stake_test1ur6zxg3w4fqpee7wqqvh2lh9krmmuew5slraaamdw3nmcjs4fljnl'),
    'addr_test1qrruw8mqstxhw9dfvvrywcvpdjwqh29uvpw8echrjvvl08l877vkxtmyqndczuu3a79ha6uezl44x8ndkwsd49vvv6hs86eznr',
  ],
  [
    decodeBech32('stake_test1upv5446dj0rp8leugh6nlxpdar5f3sqynm9n7f8wvp5f4wqvf5msg'),
    'addr_test1qrrtpzpfsn8jdqpdnxnuwrwewv709hk25knmsvuqnp76gfqp9nly7nhfzhgyrcckgtqnzyzu8psxfxrk25p2mtkxaq0s8sgq60',
  ],
  [
    decodeBech32('stake_test1uz6jsrp72r82r4hl0mkjpkd92f4hhn93446pwjnx5az43jsu6fnh5'),
    'addr_test1qz87qhgzguua2r6rtq54tz4rz2yvd583m94d8z5qw20hlv4e8pc6ffg6qxpk8wnqlxkhszg0whnucqfurnh9nf4skaysh7ufss',
  ],
  [
    decodeBech32('stake_test1uq06rscst32t2gfff8udd0p9jm9zygxy8wxmgkf5jh6uh5srucaw4'),
    'addr_test1qq4ddky8c660tc6lfcue4rjnrhxhhfc5fu9l2dqwjkkwq9dujwdsxmrr0h889w4f8f6xmhdlv600gsmfuaevk3ahlptszrs2dy',
  ],
  [
    decodeBech32('stake_test1urlux3au2u0wm3pz5jytdwcf4zdf5v0tha4vmwuh6m45p8g5z0cce'),
    'addr_test1qqwwkw9we3ws8ukaethx9pnysh2tn52u66q8scunep29r5g03yskzu3s0y7kvewhqvdma367z7w4q2gktc3shjzlhqwsk30sqy',
  ],
  [
    decodeBech32('stake_test1urskw0ymy22eg3yxvrv42nl7rdjs8qnzejpyq7pgg4408zs4x2l96'),
    'addr_test1qz3qsrjw3c52l49vglkd0g4v8tv27uycw82ugt8mgkjxnmjqwd7ahtqljmgx6h8l2y2pxyr9f2gqwpala2ul4q9r37mqm3l9pv',
  ],

  /** P10 --> D10 */
  [
    decodeBech32('stake_test1uz644sn982uuuz03shnqjdwrk6edzgfdeft9qr7xj7hcqpsfwfg3e'),
    'addr_test1qquszkgx5fkdn2ekuvkycjfcjc2hnytped05vhdwdqwhv3vs6ze5ux5uk60m3g65gj7cg0dm0pml27gv8auqpm2zampqmrtq3k',
  ],
  [
    decodeBech32('stake_test1urs5cvzstsnvu6eurdy806sap6gw62x82kwkrttrnr6nflcmq3838'),
    'addr_test1qpjpyu80pv2epzwcnk0p3schqmn7eydwgre8pehkkz3kpdukdy5xhn4m2mrk48cm9f8v66zcdj0j2ywsvydauznpadcqh53yl2',
  ],
  [
    decodeBech32('stake_test1uzhcv7fzavak9cnmevj4n0m66u67a063fcy3s3v2lq2vargc884p6'),
    'addr_test1qzc6tyncx8waat8jg23pvd8gpldewnauyy8de6frwr36v9w3luvt0j4hzfc9x5p3ds3jn09j86etc0ej9el3epwdn3lsy9ree4',
  ],
  [
    decodeBech32('stake_test1urxlt57l4uzrfpd49869jws9a5y27nd2eelhla5ndty90vstygxs9'),
    'addr_test1qqr8c39pwl34xntc2zna52jvy0ff5d2wmqdmfdw6x5fmqchq9af3wn2a585rmnex07tt6xfhqz4cktjmleskwfjja9mqwmkdj5',
  ],
  [
    decodeBech32('stake_test1uq9qfpq3fyhff9vn6w2thqn73gryu2pr58hnvf7e9h4jfuqyd8k5w'),
    'addr_test1qrgrxwa0yy47udx837n3xfqkkpt7dqg25xr8xa3uavqmu2pw8zzqgcgcjd355fepnlnwh9z8qv6c9qda2t07gculjjeqys6hq7',
  ],
  [
    decodeBech32('stake_test1urc4seg79x2c0afv0qqy7lgd6nj08ed4cpy7n490ylhqj7qe3z37q'),
    'addr_test1qpz76hpqa2l3hyn5r25dkrk93adwszlrjmwx353m5jdf2hgy8uu2e3lha5a8hd0kdvzk7ehm230rq3ztnzrj59sxjtvqxex326',
  ],
]);
