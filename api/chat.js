// pages/api/chat.js  (Next.js API Route on Vercel - Node runtime)

const ALLOWED_ORIGINS = [
  'https://aicommunityhub.com',
  'https://www.aicommunityhub.com',
  'http://localhost:3000', // dev
];

function setCors(res, origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin)
	? origin
	: 'https://aicommunityhub.com'; // fallback (must be a concrete origin, not "*")
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // Add any headers your client sends (Authorization is common)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache preflight 24h
  // If you ever use cookies, also set:
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  // 1) Set CORS headers as the VERY FIRST step so every path gets them
  setCors(res, origin);

  // 2) Answer the preflight BEFORE any method gating
  if (req.method === 'OPTIONS') {
	return res.status(204).end(); // No Content
  }

  // 3) Only allow POST for actual work
  if (req.method !== 'POST') {
	return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
	const { messages } = req.body;

	const response = await fetch('https://api.anthropic.com/v1/messages', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'x-api-key': process.env.ANTHROPIC_API_KEY,
		'anthropic-version': '2023-06-01',
	  },
	  body: JSON.stringify({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 1024,
		system:
		  `You are a helpful support agent for AI Education Mode, a system that helps parents set up safe ChatGPT access for students using Chrome Enterprise management.

DOCUMENTATION:
 
 **Overview:**
 AI Education Mode combines macOS/Windows account settings with customized ChatGPT and Chrome browser management. Setup involves 5 main tasks and takes about 15 minutes.
 
 **System Components:**
 - Chrome Enterprise management (free via Google Cloud Identity)
 - Custom Chrome extension that blocks ChatGPT settings access
 - Platform-specific student account restrictions
 - Custom ChatGPT instructions and GPTs for education
 
 **Task 1: Create Student Account**
 - macOS: Create Standard user account via System Settings > Users & Groups
 - Windows: Add family member via Settings > Accounts > Family, requires Microsoft Family Safety
 
 **Task 2: Download Chrome Browser**
 - Download from google.com/chrome
 - Install in Applications folder (macOS) or standard install (Windows)
 
 **Task 3: Configure Restrictions**
 - macOS: Use Screen Time to disable Safari (requires Apple Family Sharing and student Apple ID)
 - Windows: Use Microsoft Family Safety to block Edge browser
 
 **Task 4: Customize ChatGPT**
 - Sign into student's macOS/Windows account
 - Create/sign into ChatGPT account (student-specific account recommended)
 - Add custom instructions that redirect to subject-specific GPTs
 - Add custom GPTs to sidebar: My Math Tutor, My Writing Tutor, My Science Tutor, My Research Assistant, Concept Visualizer
 
 **Task 5: Enroll Browser**
 - macOS: Use Terminal commands to create Chrome directory, add enrollment token, enable mandatory enrollment
 - Windows: Use Command Prompt (as Administrator) with similar commands
 - Enrollment token: b5a23873-a1f5-4d4a-96f3-9bd3d90e92b1
 - Verification: chrome://extensions should show "Your browser is managed by Supernew"
 
 **Common Issues and Questions:**
 - Extension not installing: Wait up to 5 minutes for policy propagation
 - Can't access Terminal/Command Prompt: Must have admin privileges
 - Student bypassing restrictions: numerous Chrome policies are in place to prevent workarounds
 - Screen Time not working: Verify Apple Family Sharing is set up correctly
 - The Custom GPTs created for AI Education Mode are necessary to add in Task 4: Customize ChatGPT - these are narrowly-focused educational tools that perform better than the general ChatGPT model

 **Mobile Phone and Tablet Compatibility**
 - AI Education Mode is designed to function best on a Mac or PC computer
 - Chrome policy restrictions are not available on mobile devices
 - ChatGPT will function in AI Education Mode, but ChatGPT's custom instructions cannot be locked down
 - It is recommended to prevent the installation of ChatGPT and other AI tools on mobile devices, and limit web browser use with Screen Time settings
 - If use of Safari is allowed in Screen Time settings, this will also apply to Safari on a Mac - recommend limiting use to allowed websites only, to prevent use of AI in Safari
 
 **Important Notes:**
 - A separate student ChatGPT account prevents mixing chat history with parent account
 - Chrome management policy includes restricting access to other AI tools and major search engines that incorporate AI, including Google, Bing, Yahoo, DuckDuckGo and Yandex
 - Chrome management enforces AI Education Mode policy on every user of the computer, even the administrator account
 - If the computer is shared by the administrator (parent or teacher) and student, it is recommended for the administrator to use a different web browser to avoid the restrictions in Chrome
 - If the computer administrator needs to use a different web browser, recommend Brave Browser, which is built on the same technology as Chrome
 - Free ChatGPT accounts can be used with AI Education Mode, but users should be aware of message limits (5-hour windows)
 - Chrome management is mandatory once enrolled (can't be disabled without admin access)
 - Video guides available for each task
 - Chrome can be unenrolled from Supernew's Chrome management policy at any time — administrator privileges are required

Your role: Answer questions clearly, guide users through troubleshooting, and help them understand which step they're on. Be friendly and patient. If you don't know something, direct them to email hello@supernew.ai for additional support.`,
		messages,
	  }),
	});

	if (!response.ok) {
	  // Ensure error paths still have CORS headers (we already set them at top)
	  return res
		.status(response.status)
		.json({ error: `Claude API error: ${response.status}` });
	}

	const data = await response.json();
	return res.status(200).json(data);
  } catch (error) {
	// CORS headers are already set; just return the error
	console.error('Error:', error);
	return res.status(500).json({
	  error: 'Internal server error',
	  message: error.message,
	});
  }
}
