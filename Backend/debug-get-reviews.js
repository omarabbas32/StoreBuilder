const productId = '83a30cbe-de8d-411c-8fa2-3d2770655a95';

async function getReviews() {
    console.log(`Fetching reviews for product: ${productId}`);
    try {
        const res = await fetch(`http://localhost:3000/api/reviews/product/${productId}`);
        const json = await res.json();

        console.log('Status:', res.status);
        console.log('Full Response Structure:');
        console.log(JSON.stringify(json, null, 2));

        if (json.data && json.data.data) {
            console.log('First Review Item:');
            console.log(JSON.stringify(json.data.data[0], null, 2));
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

getReviews();
