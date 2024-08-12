transaction = [
  transaction_body, 						// TxBody
  transaction_witness_set, 			// TxWitness
  true,                         // script validity 
  null                          // script metadata (TxMetadata)
];

transaction_body = {
  0: set(transaction_input),    // kumpulan inputs UTXO
  1: [transaction_output],      // kumpulan TxOut
  2: fee,                       // biaya transaksi dalam satuan lovelace
  3: timeToLive                 // transaksi akan expired pada slot waktu
}

transaction_input = [TxId, index]           
transaction_output = [addressHex, amount]   
// TxId: 32 bytes Blake2b-256, index: uint 2 bytes, 
// addressHex: 57 bytes Blake2b-224, amount: uint 4 bytes atau uint 8 bytes

transaction_witness_set = {0: [vkeywitness]}
vkeywitness = [vkey, signature]
// vkey: 32 bytes BIP32-Ed25519 public key
// signature: 64 bytes BIP32-Ed25519 signature

[
	{
		0: [
			[<TxId>, <index>],		// input UTXO pengguna 1
			[<TxId>, <index>], 		// input UTXO pengguna 2
			.... 									
		],
		1: [
			[<destination_addr>, <amount>],		// address tujuan dari pengguna 1
			[<change_addr>, <amount>], 				// address kembalian dari pengguna 1
			[<destination_addr>, <amount>],		// address tujuan dari pengguna 2
			[<change_addr>, <amount>], 				// address kembalian dari pengguna 2
			.... 																					
		],
		2: <total_fee>,					// total biaya transaksi
		3: <slot_ttl>, 					// waktu expired transaksi
	},
	{
		0: [
			[<vkey>, <signature>] 			// signature dari pengguna 1
			[<vkey>, <signature>] 			// signature dari pengguna 2
			.... 												
		]
	},
	true,
  null
]



[
	{
		0: [
			[
				h'1f2a406e60b5fd69d4e2e7f3fe0729170879bac3e1facff23c78aa65963402cd',
				0
			],
			[
				h'954102a120fc153e75092be8df418d0b9d51820dc80366312d307fcc909dd9f3',
				0
			]
		],
		1: [
			[
				h'0003b7ad57a1509c1cbf217e690835871edc3c2c60b36f67127020d9e89c32a67216b3b11e1254facb70b44629e85a3594a8b5d0285b1c37bf',
				1100000000
			],
			[
				h'005166cdb96fedf158674583de9c1cff592cdc7fce4fab295268d9d2b12f6d1a60b7ab32567b76b1d34e2afb544b3b8db70667ad2841e7820e',
				1074141364
			]
		],
		2: 174433,
		3: 42488494,
	},
	{
		0: [
			[
				h'd338ea98bba36eb8e8a5aa0805a247882edf6b393ef71862f95081c23cb91800',
				h'90c8bf03bfba0bb0d0fcf3237f505869bcd721ebc34070269036de841258048bab3771fc582453635932716d020a4ca2e5c5ac84524c4ba1cb5652baecbae00d'
			],
			[
				h'ca78d533b49aa1765f0b56ddbbb1a0df8a0c8d6c9fa6a4e49546323522358b84',
				h'34ab3a70232ffe444a2f45697bccc7a68f64cde37702022611d5913ed85556eab1a824e36d7d10b02856dc9bc97ad2bdc8d6798331107e565ca1ec9d61534b08'
			]
		]
	},
	true,
  null
]
