import { executeTestPurchase } from "./wallet-test-purchase.js";
import { comparePromiseAndDelivery, LiveVerification } from "./compare-promise-delivery.js";

export async function runMysteryShopper(
    targetId: string, 
    endpointUrl: string, 
    advertisedPrice: number
): Promise<LiveVerification> {
    
    // Attempt the purchase
    const purchaseResult = await executeTestPurchase(targetId, endpointUrl, advertisedPrice);
    
    // Evaluate the result
    return comparePromiseAndDelivery(purchaseResult, advertisedPrice);
}
