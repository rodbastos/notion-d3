import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { databaseId, notionKey } = await request.json()

    // Use the user-provided key if available, otherwise use the environment key
    const apiKey = notionKey || process.env.NOTION_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Notion API key is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Name',
            direction: 'ascending',
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Notion API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Notion' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const notionKey = searchParams.get('notionKey')

    if (!pageId || !notionKey) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Notion-Version': '2022-06-28',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch page data' }, { status: 500 })
  }
} 