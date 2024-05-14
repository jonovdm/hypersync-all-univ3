import { keccak256, toHex } from 'viem';
import { HypersyncClient } from "@envio-dev/hypersync-client";

//Please note this contract emits zero events
const addresses = [
  "0xeFE9a82d56cd965D7B332c7aC1feB15c53Cd4340".toLowerCase(),
];

const client = HypersyncClient.new({
  url: "http://eth.hypersync.xyz"
});

//Goal: I'm trying to get all transactions involving the contract above, so I can extract information from the data/input of these transactions
//block used is a random block that contains a tx to the contract I care about: https://etherscan.io/tx/0xae381b28dadeb5120a8b5033958375c502fa8564e576569e29942b34f1e0214c
let query = {
  "fromBlock": 19799508,
  "transactions": [
    {
      to: addresses
    }
  ],
  "fieldSelection": {
    "transaction": [
      "from",
      "to",
      "input"
    ]
  },
};

const main = async () => {
  let results = []
  // Send an initial non-parallelized request to find first events
  const res = await client.sendEventsReq(query);
  results.push(res)
  query.fromBlock = res.nextBlock;

  const stream = await client.stream(query, { retry: true, batchSize: 10000, concurrency: 12 });

  while (true) {
    const res = await stream.recv();
    // Quit if we reached the tip
    if (res === null) {
      console.log(`reached the tip`);
      break;
    }

    // console.log(res)
    console.log(`scanned up to ${res.nextBlock}`);
    results.push(res)
  }
  //MY PROBLEM: Why aren't the transactions being picked up?
  console.log(results)
};

main();