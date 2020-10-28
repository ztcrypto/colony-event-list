import {
  getColonyNetworkClient,
  Network,
  ColonyRole,
  ColonyClientV2,
  ColonyClient,
  getBlockTime,
} from "@colony/colony-js";
import { Wallet } from "ethers";
import { InfuraProvider } from "ethers/providers";
import { utils, EventFilter } from "ethers";
import { getLogs } from "@colony/colony-js";
import { Event, SYMBOL, EventTypes } from "../types";

// Set up the network address constants that you'll be using
// The two below represent the current ones on mainnet
// Don't worry too much about them, just use them as-is
const MAINNET_NETWORK_ADDRESS = "0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef";
const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;

const provider = new InfuraProvider(
  "mainnet",
  "283df27ce8ef46c8acd565964b07d217"
);

// Get a random wallet
// You don't really need control over it, since you won't be firing any trasactions out of it
const wallet = Wallet.createRandom();
// Connect your wallet to the provider
const connectedWallet = wallet.connect(provider);

interface NetworkClientOptions {
  networkAddress?: string;
  oneTxPaymentFactoryAddress?: string;
  reputationOracleEndpoint?: string;
}

export default class EventLogger {
  events: Event[];
  curPos: number;
  client?: ColonyClient;

  constructor() {
    this.events = [];
    this.curPos = 0;
  }

  /**
   * @func Init Initialize ColonyClient and generate raw events list
   */
  async init() {
    // Get a network client instance
    const networkClient = await getColonyNetworkClient(
      Network.Mainnet,
      connectedWallet,
      MAINNET_NETWORK_ADDRESS as NetworkClientOptions
    );
    this.client = await networkClient.getColonyClient(
      MAINNET_BETACOLONY_ADDRESS
    );
    // Get the filter
    // There's a corresponding filter method for all event types
    const filters: EventFilter[] = [];
    filters.push(this.client.filters.PayoutClaimed(null, null, null));
    filters.push(this.client.filters.ColonyInitialised(null, null));
    filters.push(this.client.filters.DomainAdded(null));
    filters.push(
      (this.client as ColonyClientV2).filters.ColonyRoleSet(
        null,
        null,
        null,
        null
      )
    );

    const multipleTopics = filters.reduce((topicsArray: string[][], filter) => {
      if (filter.topics) {
        filter.topics.forEach((topic: any, i: number) => {
          if (topicsArray[i]) {
            topicsArray[i].push(topic);
          } else {
            topicsArray[i] = [topic];
          }
        });
      }
      return topicsArray;
    }, []);
    const filter = Object.assign(Object.assign({}, filters[0]), {
      topics: multipleTopics,
    });

    // Get the raw logs array
    const eventLogs = await getLogs(this.client, filter);
    const parsedLogs = eventLogs.map((event) =>
      (this.client as ColonyClientV2).interface.parseLog(event)
    );

    const promiseArr: Promise<Event>[] = [];

    // Parse logs and generate events promise array.
    parsedLogs.forEach((singleLog, index) => {
      promiseArr.push(
        new Promise(async (resolve) => {
          const logTime = await getBlockTime(
            provider,
            eventLogs[index].blockHash as string
          );
          const event: Event = {
            name: singleLog.name,
            logTime,
            transactionHash: eventLogs[index].transactionHash as string,
            values: singleLog.values,
          };
          resolve(event);
        })
      );
    });

    // Resolve events promise array and sort by event time.
    this.events = await Promise.all(promiseArr);
    this.events = this.events.sort((a, b) => b.logTime - a.logTime);
  }

  /**
   * @func getConvertedLogs Return part of parsed events list.
   */
  async getConvertedLogs(pos: number) {
    if (pos === 0) await this.init();

    // Iterate every 10 events and generate a promise array.
    const promiseArr: Promise<Event>[] = [];
    for (let i = pos; i < pos + 10; i++) {
      if (i >= this.events.length) break;
      const event = this.events[i];
      promiseArr.push(
        new Promise(async (resolve, reject) => {
          try {
            const client = this.client as ColonyClientV2;

            if (event.name === EventTypes.PAYOUT_CLAIMED) {
              const humanReadableFundingPotId = new utils.BigNumber(
                event.values.fundingPotId
              ).toString();

              const res = await client.getFundingPot(humanReadableFundingPotId);
              const { recipient: userAddress } = await client.getPayment(
                res.associatedTypeId
              );
              event.userAddress = userAddress;
              event.fundingPotId = humanReadableFundingPotId;
              // Get a base 10 value as a BigNumber instance
              const wei = new utils.BigNumber(10);
              // Create a new BigNumber instance from the hex string amount in the parsed log
              const humanReadableAmount = new utils.BigNumber(
                event.values.amount
              );

              // The converted amount is the human readable amount divided by the wei value raised to the power of 18
              const convertedAmount = humanReadableAmount.div(wei.pow(18));
              event.amount = convertedAmount.toString();
              event.token = SYMBOL[event.values.token];
            } else if (event.name === EventTypes.DOMAIN_ADDED) {
              event.domainId = new utils.BigNumber(
                event.values.domainId
              ).toString();
            } else if (event.name === EventTypes.COLONY_ROLE_SET) {
              event.userAddress = event.values.user;
              event.role = ColonyRole[event.values.role];
              event.domainId = new utils.BigNumber(
                event.values.domainId
              ).toString();
            }
            resolve(event);
          } catch (err) {
            reject(err);
          }
        })
      );
    }
    const _converted = await Promise.all(promiseArr);
    return _converted;
  }
}
