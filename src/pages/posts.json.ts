import posts from '../content/posts.json';

export async function GET() {
    return new Response(
        JSON.stringify(posts),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}
