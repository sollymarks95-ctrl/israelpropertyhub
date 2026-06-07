import Link from 'next/link'
import type { Metadata } from 'next'

const LEGAL: Record<string, { title: string; content: () => JSX.Element }> = {
  privacy: {
    title: 'Privacy Policy',
    content: () => (
      <>
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2>1. Who We Are</h2>
        <p>RepHuby Intelligence Ltd ("we", "our", "us") operates a network of professional financial news and intelligence publications. Our registered address is 71-75 Shelton Street, London, WC2H 9JQ, United Kingdom.</p>
        <h2>2. What Information We Collect</h2>
        <p>We may collect the following types of personal information:</p>
        <ul>
          <li><strong>Newsletter subscribers:</strong> Email address, date of subscription, IP address, and the publication you subscribed to.</li>
          <li><strong>Website visitors:</strong> IP address, browser type, operating system, pages visited, time spent on pages, referring URL, and device information collected through analytics cookies.</li>
          <li><strong>Contact form submissions:</strong> Name, email address, company name, and message content.</li>
        </ul>
        <h2>3. How We Use Your Information</h2>
        <p>We use your personal information for the following purposes:</p>
        <ul>
          <li>To send you the newsletters and market intelligence publications you have subscribed to;</li>
          <li>To improve the quality and relevance of our publications;</li>
          <li>To analyse website traffic and user behaviour using anonymised analytics data;</li>
          <li>To respond to your enquiries and provide customer support;</li>
          <li>To comply with our legal obligations, including financial crime prevention requirements.</li>
        </ul>
        <h2>4. Legal Basis for Processing</h2>
        <p>We process your personal data under the following legal bases under the UK GDPR and EU GDPR: (a) Consent — for newsletter subscriptions and marketing communications; (b) Legitimate Interests — for website analytics and fraud prevention; (c) Legal Obligation — for regulatory compliance.</p>
        <h2>5. Data Retention</h2>
        <p>We retain newsletter subscriber data for the duration of your subscription plus 2 years. Website analytics data is retained for 26 months. Contact enquiry data is retained for 3 years. You may request deletion of your personal data at any time.</p>
        <h2>6. Your Rights</h2>
        <p>Under applicable data protection law, you have the following rights: the right to access your personal data; the right to rectification; the right to erasure; the right to restriction of processing; the right to data portability; the right to object; and the right to lodge a complaint with the Information Commissioner's Office (ICO) or your local supervisory authority.</p>
        <h2>7. Cookies</h2>
        <p>We use cookies to improve your browsing experience and analyse website traffic. See our Cookie Policy for full details.</p>
        <h2>8. Third-Party Services</h2>
        <p>We use the following third-party services that may process your personal data: Supabase (database hosting, EU servers); Vercel (website hosting, global CDN); TradingView (chart widgets, data feeds); Google Analytics (anonymised website analytics). Each service provider has its own privacy policy and data processing terms.</p>
        <h2>9. International Transfers</h2>
        <p>Your personal data may be transferred to and processed in countries outside the UK/EEA. Where such transfers occur, we ensure appropriate safeguards are in place, including Standard Contractual Clauses or adequacy decisions.</p>
        <h2>10. Contact Us</h2>
        <p>For any privacy-related enquiries or to exercise your rights, please contact our Data Protection Officer at: <strong>privacy@rephub.com</strong> or write to us at our registered address.</p>
      </>
    )
  },
  terms: {
    title: 'Terms of Use',
    content: () => (
      <>
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using any publication within the RepHuby Intelligence network ("Services"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our Services.</p>
        <h2>2. Nature of the Service</h2>
        <p>RepHuby Intelligence publications provide financial news, market commentary, analysis, and data for informational purposes only. Our Services do not constitute financial advice, investment advice, trading advice, or any other type of professional advice. Information provided through our Services should not be relied upon as a basis for making financial or investment decisions.</p>
        <h2>3. No Investment Advice</h2>
        <p>Nothing on our websites constitutes a solicitation or offer to buy or sell any financial instrument or investment product. We are not authorised or regulated by the Financial Conduct Authority (FCA) or any other regulatory body to provide investment advice. You should consult a qualified financial adviser before making any investment decisions.</p>
        <h2>4. Accuracy of Information</h2>
        <p>While we endeavour to ensure that information published through our Services is accurate and up-to-date, we make no warranty, express or implied, regarding the accuracy, completeness, or timeliness of any information provided. Market data, prices, and news are subject to change without notice and may not reflect current market conditions.</p>
        <h2>5. Intellectual Property</h2>
        <p>All content on RepHuby Intelligence publications, including but not limited to text, graphics, logos, images, and data compilations, is the property of RepHuby Intelligence Ltd or its content providers and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without our express written permission.</p>
        <h2>6. Prohibited Uses</h2>
        <p>You agree not to: use our Services for any unlawful purpose; scrape or systematically extract data from our websites without permission; interfere with the proper functioning of our Services; attempt to gain unauthorised access to our systems; or use our content in any way that misrepresents its source or our organisation.</p>
        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, RepHuby Intelligence Ltd shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of our Services or reliance on any information provided therein. This limitation applies regardless of whether such damages were foreseeable.</p>
        <h2>8. Third-Party Links</h2>
        <p>Our Services may contain links to third-party websites and services. We have no control over and accept no responsibility for the content, privacy practices, or availability of third-party websites. Links are provided for convenience only.</p>
        <h2>9. Governing Law</h2>
        <p>These Terms of Use are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        <h2>10. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to our websites. Your continued use of our Services following any changes constitutes your acceptance of the updated terms.</p>
      </>
    )
  },
  'risk-warning': {
    title: 'Risk Warning',
    content: () => (
      <>
        <div style={{ background:'#fee2e2', border:'2px solid #dc2626', borderRadius:6, padding:20, marginBottom:24 }}>
          <strong style={{ color:'#dc2626', fontSize:16 }}>⚠️ IMPORTANT RISK DISCLOSURE — PLEASE READ CAREFULLY</strong>
        </div>
        <h2>General Risk Warning</h2>
        <p>Trading in financial instruments and/or cryptocurrencies involves high risks including the risk of losing some or all of your investment amount, and may not be suitable for all investors.</p>
        <h2>Currency Risk</h2>
        <p>The value of investments denominated in foreign currencies may be affected by fluctuations in exchange rates. Prices of cryptocurrencies are extremely volatile and may be affected by external factors such as financial, regulatory, or political events.</p>
        <h2>Leverage Risk</h2>
        <p>Trading on margin increases the financial risks. Before deciding to trade in financial instruments or cryptocurrencies, you should be fully informed of the risks and costs associated with trading the financial markets. You should carefully consider your investment objectives, level of experience, and risk appetite.</p>
        <h2>Past Performance</h2>
        <p>Past performance is not indicative of future results. The value of investments can fall as well as rise. You may receive back less than you originally invested. Market analysis and commentary published on our platforms represents the views of individual analysts and does not constitute a guarantee of future performance.</p>
        <h2>Data Accuracy</h2>
        <p>RepHuby Intelligence Ltd would like to remind you that the data contained in our publications is not necessarily real-time nor accurate. The data and prices on our websites may not necessarily be provided by any market or exchange, but may be provided by market makers, and so prices may not be accurate and may differ from the actual price at any given market.</p>
        <h2>Not Investment Advice</h2>
        <p>Nothing on our websites constitutes investment advice. Our publications are for informational and educational purposes only. We are not a licensed investment adviser, broker, or dealer. You should seek independent financial advice from a qualified professional before making any investment decisions.</p>
        <h2>Regulatory Status</h2>
        <p>RepHuby Intelligence Ltd is a news and information publisher. We are not authorised or regulated by the Financial Conduct Authority or any other financial regulatory authority to provide investment advice or recommendations.</p>
        <h2>Seek Professional Advice</h2>
        <p>If you are in any doubt about the suitability of any investment for your circumstances, you should seek independent financial and legal advice.</p>
      </>
    )
  },
  cookies: {
    title: 'Cookie Policy',
    content: () => (
      <>
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h2>What Are Cookies?</h2>
        <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
        <h2>How We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <h3>Essential Cookies</h3>
        <p>These cookies are necessary for our websites to function and cannot be disabled. They include session cookies that enable you to navigate our sites and use core features, and security cookies that protect against fraud and ensure service security.</p>
        <h3>Analytics Cookies</h3>
        <p>We use analytics cookies to understand how visitors interact with our websites. This helps us improve our publications and user experience. Analytics data is processed in anonymised form.</p>
        <p><strong>Google Analytics:</strong> We use Google Analytics to track website usage. Google Analytics sets several cookies (_ga, _gid, _gat) that collect anonymised data about browsing behaviour. You can opt out of Google Analytics using the Google Analytics Opt-out Browser Add-on.</p>
        <h3>Functional Cookies</h3>
        <p>These cookies enable enhanced functionality such as remembering your preferences, language settings, and newsletter subscription status.</p>
        <h3>Third-Party Cookies</h3>
        <p>Some content on our websites, including TradingView chart widgets, may set their own cookies for functionality and analytics purposes. These are governed by the respective third parties' cookie policies.</p>
        <h2>Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or alert you when cookies are set. Note that disabling certain cookies may affect the functionality of our websites.</p>
        <p>To opt out of non-essential cookies on our sites, click "Reject Non-Essential" in the cookie consent banner that appears when you first visit our websites.</p>
        <h2>Changes to This Policy</h2>
        <p>We may update this Cookie Policy from time to time. We will notify you of any significant changes by displaying a prominent notice on our websites.</p>
      </>
    )
  },
  about: {
    title: 'About RepHuby Intelligence',
    content: () => (
      <>
        <h2>Who We Are</h2>
        <p>RepHuby Intelligence operates a network of twelve professional financial news and market intelligence publications, covering global trade, commodity markets, financial markets, business strategy, and professional services for the international business community.</p>
        <p>Our publications serve financial professionals, commodity traders, business executives, and investors who require accurate, timely, and professionally written intelligence to inform their commercial decisions.</p>
        <h2>Our Publications</h2>
        <p>The RepHuby Intelligence network includes:</p>
        <ul>
          <li><strong>Nexwire</strong> — Global trade news and supply chain intelligence</li>
          <li><strong>Finvex</strong> — Financial markets, currencies, and investment analysis</li>
          <li><strong>AurexHQ</strong> — Precious metals and commodity markets</li>
          <li><strong>Bizplex</strong> — Business strategy and corporate intelligence</li>
          <li><strong>Verivex</strong> — B2B reputation and business trust research</li>
          <li><strong>Bizpedia</strong> — Company profiles and industry reference</li>
          <li><strong>PresxWire</strong> — Corporate press releases and announcements</li>
          <li><strong>InvexHub</strong> — Investment intelligence and M&A analysis</li>
          <li><strong>Tradvex</strong> — Trade community and professional development</li>
          <li><strong>Certivade</strong> — Trade certification and compliance standards</li>
          <li><strong>Execvex</strong> — Executive careers and leadership intelligence</li>
          <li><strong>Signalix</strong> — Market signals and technical analysis</li>
        </ul>
        <h2>Our Editorial Standards</h2>
        <p>RepHuby Intelligence is committed to the highest standards of accuracy, fairness, and independence in our editorial content. Our team of journalists and analysts combine deep industry expertise with rigorous reporting standards. We do not accept payment to influence editorial coverage and clearly distinguish between news content and commercially supported content.</p>
        <h2>Our Technology</h2>
        <p>Our publications use a combination of professional journalism, expert analysis, and AI-assisted content generation to produce the volume and breadth of coverage that our readers require. All AI-assisted content is reviewed for accuracy and relevance before publication.</p>
        <h2>Regulatory Information</h2>
        <p>RepHuby Intelligence Ltd is a news and information publisher registered in England and Wales. We are not authorised by the Financial Conduct Authority to provide investment advice. Our content is provided for informational purposes only.</p>
        <p><strong>Registered Address:</strong> 71-75 Shelton Street, London, WC2H 9JQ, United Kingdom</p>
      </>
    )
  },
  contact: {
    title: 'Contact Us',
    content: () => (
      <>
        <h2>Get in Touch</h2>
        <p>We welcome feedback, news tips, press release submissions, and enquiries about our publications.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
          {[
            { title:'Editorial', email:'editorial@rephub.com', desc:'News tips, corrections, and editorial enquiries' },
            { title:'Press Releases', email:'press@rephub.com', desc:'Submit press releases and announcements' },
            { title:'Advertising', email:'advertising@rephub.com', desc:'Commercial partnerships and advertising' },
            { title:'Privacy & Data', email:'privacy@rephub.com', desc:'Data protection and privacy enquiries' },
            { title:'Legal', email:'legal@rephub.com', desc:'Legal enquiries and copyright issues' },
            { title:'Technical', email:'tech@rephub.com', desc:'Website issues and technical support' },
          ].map(c => (
            <div key={c.title} style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, padding:16 }}>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:13, color:'#6b7280', marginBottom:8 }}>{c.desc}</div>
              <a href={`mailto:${c.email}`} style={{ color:'#3b82f6', fontWeight:600, fontSize:13 }}>{c.email}</a>
            </div>
          ))}
        </div>
        <h2>Registered Address</h2>
        <p>RepHuby Intelligence Ltd<br/>71-75 Shelton Street<br/>London, WC2H 9JQ<br/>United Kingdom</p>
        <h2>Newsletter Subscriptions</h2>
        <p>To manage your newsletter subscription, unsubscribe, or update your preferences, please email: <a href="mailto:newsletter@rephub.com" style={{color:'#3b82f6'}}>newsletter@rephub.com</a></p>
        <p>Please include your email address and which publications you wish to subscribe to or unsubscribe from.</p>
        <h2>Response Times</h2>
        <p>We aim to respond to all editorial enquiries within 2 business days. Legal and privacy enquiries will be responded to within the statutory timeframes (30 days for data subject access requests).</p>
      </>
    )
  },
  advertise: {
    title: 'Advertise With Us',
    content: () => (
      <>
        <h2>Reach the Global Trading Community</h2>
        <p>The RepHuby Intelligence network reaches over 200,000 professional readers monthly across its twelve publications, comprising commodity traders, financial professionals, business executives, and investors actively engaged in international commerce.</p>
        <h2>Our Audience</h2>
        <ul>
          <li>Commodity traders and trading companies across metals, energy, and agricultural markets</li>
          <li>Trade finance professionals at banks, insurance companies, and fintech firms</li>
          <li>Senior executives at multinational corporations managing global supply chains</li>
          <li>Investment professionals at private equity firms, family offices, and asset managers</li>
          <li>Compliance officers and legal professionals serving the trading industry</li>
        </ul>
        <h2>Advertising Options</h2>
        <p>We offer a range of advertising and sponsorship solutions tailored to the professional financial media environment:</p>
        <ul>
          <li><strong>Display Advertising:</strong> Banner and display placements across our publication network</li>
          <li><strong>Newsletter Sponsorship:</strong> Dedicated placement in our daily briefing newsletters</li>
          <li><strong>Sponsored Content:</strong> Clearly labelled, professionally written sponsored articles and analysis</li>
          <li><strong>Event Sponsorship:</strong> Sponsorship of webinars, reports, and special publications</li>
          <li><strong>Press Release Distribution:</strong> Professional distribution of corporate announcements through PresxWire</li>
        </ul>
        <h2>Editorial Independence</h2>
        <p>All commercial content is clearly labelled and maintained separately from our independent editorial coverage. Advertising relationships do not influence our editorial decisions.</p>
        <h2>Contact Our Commercial Team</h2>
        <p>Email: <a href="mailto:advertising@rephub.com" style={{color:'#3b82f6'}}>advertising@rephub.com</a><br/>We will respond within one business day with our current rate card and availability.</p>
      </>
    )
  }
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params
  const legal = LEGAL[page]
  if (!legal) return { title: 'Legal | RepHuby Intelligence' }
  return {
    title: `${legal.title} | RepHuby Intelligence`,
    description: `RepHuby Intelligence ${legal.title}`,
    robots: 'noindex, nofollow',
  }
}

export default async function LegalPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params
  const legal = LEGAL[page]

  const NAV_PAGES = [
    { slug:'privacy', label:'Privacy Policy' },
    { slug:'terms', label:'Terms of Use' },
    { slug:'risk-warning', label:'Risk Warning' },
    { slug:'cookies', label:'Cookie Policy' },
    { slug:'about', label:'About Us' },
    { slug:'contact', label:'Contact' },
    { slug:'advertise', label:'Advertise' },
  ]

  if (!legal) {
    return (
      <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:'sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
          <h1 style={{ fontSize:24, fontWeight:900, marginBottom:12 }}>Page Not Found</h1>
          <Link href="/legal/about" style={{ color:'#3b82f6' }}>Go to About Us →</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:'sans-serif' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:#3b82f6;text-decoration:none}
        a:hover{text-decoration:underline}
        h2{font-size:18px;font-weight:800;color:#111;margin:1.5em 0 0.6em;padding-bottom:6px;border-bottom:2px solid #e5e7eb}
        h3{font-size:15px;font-weight:700;color:#374151;margin:1.2em 0 0.4em}
        p{font-size:14px;line-height:1.8;color:#374151;margin-bottom:0.8em}
        ul,ol{margin:0.5em 0 1em 1.5em;font-size:14px;line-height:1.8;color:#374151}
        li{margin-bottom:0.3em}
        strong{color:#111}
      `}</style>

      {/* HEADER */}
      <header style={{ background:'#1e293b', padding:'14px 24px', display:'flex', alignItems:'center', gap:16, justifyContent:'space-between' }}>
        <Link href="/news/global-trade-wire">
          <div style={{ fontWeight:900, fontSize:20, color:'#fff' }}>RepHuby Intelligence</div>
        </Link>
        <span style={{ color:'#64748b', fontSize:12 }}>Legal & Compliance</span>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px', display:'grid', gridTemplateColumns:'220px 1fr', gap:28 }}>
        {/* SIDEBAR NAV */}
        <nav style={{ alignSelf:'start', position:'sticky', top:20 }}>
          <div style={{ background:'#fff', borderRadius:6, border:'1px solid #e5e7eb', overflow:'hidden' }}>
            <div style={{ background:'#1e293b', color:'#fff', padding:'12px 16px', fontWeight:800, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em' }}>Legal Pages</div>
            {NAV_PAGES.map(p => (
              <Link key={p.slug} href={`/legal/${p.slug}`}>
                <div style={{ padding:'11px 16px', borderBottom:'1px solid #f3f4f6', fontSize:13, fontWeight:p.slug===page?800:500, color:p.slug===page?'#3b82f6':'#374151', background:p.slug===page?'#eff6ff':'transparent', cursor:'pointer', borderLeft:p.slug===page?'3px solid #3b82f6':'3px solid transparent' }}>
                  {p.label}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:6, border:'1px solid #e5e7eb', padding:14, marginTop:14, fontSize:12, color:'#6b7280' }}>
            <div style={{ fontWeight:700, color:'#374151', marginBottom:6 }}>RepHuby Intelligence Ltd</div>
            <div>71-75 Shelton Street</div>
            <div>London, WC2H 9JQ</div>
            <div>United Kingdom</div>
            <div style={{ marginTop:8 }}><a href="mailto:info@rephub.com">info@rephub.com</a></div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ background:'#fff', borderRadius:6, border:'1px solid #e5e7eb', padding:'28px 36px' }}>
          <div style={{ marginBottom:20, paddingBottom:16, borderBottom:'3px solid #1e293b' }}>
            <div style={{ fontSize:12, color:'#9ca3af', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Legal</div>
            <h1 style={{ fontSize:28, fontWeight:900, color:'#111' }}>{legal.title}</h1>
          </div>
          {legal.content()}
          <div style={{ marginTop:32, paddingTop:20, borderTop:'1px solid #e5e7eb', fontSize:12, color:'#9ca3af' }}>
            © {new Date().getFullYear()} RepHuby Intelligence Ltd · All rights reserved
          </div>
        </main>
      </div>
    </div>
  )
}
