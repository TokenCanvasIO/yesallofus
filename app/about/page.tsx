'use client';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0d0d0d]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/dltpayslogo1.png" alt="YesAllofUs" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl hidden sm:inline">YesAllofUs</span>
          </a>
          <nav className="flex gap-6 text-sm">
            <a href="/" className="text-zinc-400 hover:text-white">Home</a>
            <a href="/docs" className="text-zinc-400 hover:text-white">Docs</a>
            <a href="/#get-started" className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200">Get Started</a>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="flex items-center gap-6 mb-12">
          <img 
            src="/mark.jpg" 
            alt="Mark" 
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">Hey, I&apos;m Mark</h1>
            <p className="text-zinc-400">Family therapist turned developer · Guernsey</p>
          </div>
        </div>

        {/* The Name */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Why YesAllofUs</h2>
          <div className="text-zinc-300 space-y-4">
            <p>
              The logo is two people embracing. That&apos;s what this is about.
            </p>
            <p>
              A commission isn&apos;t just money moving. It&apos;s two people agreeing to work together. 
              One embracing the other, and the other reciprocates. Both win. The logo shows that — two forms connected, 
              value flowing between them.
            </p>
            <p>
              YesAllofUs means everyone gets their share. The affiliate in Lagos gets paid 
              the same speed as the one in London. The creator with 100 followers and the one 
              with 100,000. The small shop and the big brand. All of us.
            </p>
          </div>
        </section>

        {/* Why I Built This */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Why I Built This</h2>
          <div className="text-zinc-300 space-y-4">
            <p>
              $15/month is survival wages in some countries. With a phone and an internet 
              connection, someone can promote a product, earn a commission, and get paid 
              instantly. No bank account. No payment country restrictions. No 30-day wait. 
              No minimum threshold.
            </p>
            <p>
              That&apos;s economic mobility. That&apos;s what I want to build.
            </p>
            <p>
              The business case is simple too — instant payouts make affiliates more loyal, 
              more motivated, more likely to promote again. Everyone wins.
            </p>
          </div>
        </section>

        {/* What Makes It Different */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">4 Seconds</h3>
              <p className="text-zinc-400 text-sm">Sale completes, affiliate gets paid. Not 30 days. Now.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="text-2xl mb-2">🔐</div>
              <h3 className="font-semibold mb-1">Non-Custodial</h3>
              <p className="text-zinc-400 text-sm">Your wallet, your keys. I never touch your funds.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold mb-1">Everywhere</h3>
              <p className="text-zinc-400 text-sm">No borders. No bank required. Just a wallet and a phone.</p>
            </div>
          </div>
        </section>

        {/* Background */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">My Background</h2>
          <div className="text-zinc-300 space-y-4">
            <p>
              I&apos;m a family therapist. I&apos;ve spent years working with children in care, 
              helping people navigate systems that often feel stacked against them.
            </p>
            <p>
              That work taught me something: connection matters. People thrive when they&apos;re 
              part of something, when they&apos;re not left behind. That&apos;s what I&apos;m trying 
              to build here — infrastructure that includes everyone.
            </p>
            <p>
              I started coding in June 2024. No CS degree. Just curiosity, late nights, and AI 
              as my engineering partner. Five months later, I&apos;d built three production platforms:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">→</span>
                <div>
                  <a href="https://tokencanvas.io" target="_blank" rel="noopener noreferrer" className="text-white hover:text-zinc-300">TokenCanvas.io</a>
                  <span className="text-zinc-500 ml-2">— Crypto portfolio tracker</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">→</span>
                <div>
                  <a href="https://xrp3d.ai" target="_blank" rel="noopener noreferrer" className="text-white hover:text-zinc-300">XRP3D.ai</a>
                  <span className="text-zinc-500 ml-2">— AI-powered NFT conversion</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">→</span>
                <div>
                  <a href="https://xrpmemecoins.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-zinc-300">XRPMemeCoins.com</a>
                  <span className="text-zinc-500 ml-2">— #7 on Google for &quot;xrp memecoins&quot;</span>
                </div>
              </li>
            </ul>
            <p>
              YesAllofUs is the next step. Real infrastructure for real businesses. 
              Built on rails I believe will run for the next 100 years.
            </p>
          </div>
        </section>

        {/* What I Believe */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">What I Believe</h2>
          <div className="text-zinc-300 space-y-4">
            <p>
              Don&apos;t let anything get in the way of human goodness.
            </p>
            <p>
              Be grateful every day. Give OTHERS a chance. Take your chances. 
              Build things that matter. Die knowing you tried with everything you had.
            </p>
            <p className="text-zinc-500 italic">
              Own your reputation. Built on your hard work. Proven on-chain.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Get In Touch</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-zinc-300 mb-6">
              Questions? Want to talk integration? Or just want to say hi?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:mark@yesallofus.com" 
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                mark@yesallofus.com
              </a>
              <a 
                href="https://x.com/YesAllofUs" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @YesAllofUs
              </a>
              <a 
                href="https://calendly.com/tokencanvasio/30min" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book a call
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}