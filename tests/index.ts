import { testDB } from "./auction_db_test";
import { testAuctionService } from "./auction_service_test";
import { testAuctionStore } from "./auction_store_test";
import { testIndexArray } from "./index_array_test";


console.log('INDEX ARRAY TEST');
testIndexArray();
console.log('AUCTION DB TEST');
testDB();
console.log('AUCTION STORE TEST');
testAuctionStore();
console.log('AUCTION SERVICE TEST');
testAuctionService();