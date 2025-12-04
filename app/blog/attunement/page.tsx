'use client';

import Link from 'next/link';

export default function AttunementBlog() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-2">
          ← Home
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-12">
        <p className="text-emerald-400 text-sm font-medium mb-4">Insights</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          The $10 Billion Still Face: Using Attachment Theory to Engineer Unstoppable Customer Loyalty
        </h1>
        <p className="text-zinc-400 text-lg mb-6">
          Applying developmental psychology to AI, merchants, and affiliates.
        </p>
        <div className="flex items-center gap-3">
          <img 
            src="/mark.jpg" 
            alt="Mark Flynn" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-zinc-200 text-sm font-medium">Mark Flynn, Founder & Builder</p>
            <p className="text-zinc-500 text-sm">Social Worker & Video Interaction Guidance Practitioner</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 pb-20">
        
        {/* Executive Summary */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10">
          <h2 className="text-emerald-400 font-semibold mb-3">Summary</h2>
          <p className="text-zinc-300 leading-relaxed">
            I've identified the single most important factor determining which AI, merchant, and 
            affiliate succeeds: <strong className="text-white">attunement</strong>. Not intelligence. 
            Not speed. Not features. All three parties are engaged in the same fundamental struggle: 
            relationship building. Drawing on my background in Video Interaction Guidance (VIG), the 
            AI that makes humans feel genuinely remembered, understood, and held succeeds. The merchant 
            who attunes to their customers succeeds. The affiliate who connects authentically succeeds. 
            Because attunement meets a need older than language — and those who master these principles 
            succeed together in a single ecosystem.
          </p>
        </div>

        {/* The Core Insight */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            The Core Insight
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              When AI forgets, goes blank, or loses context, it's not just "annoying." It triggers 
              a primal response. The nervous system registers it as rupture — the same way an infant 
              registers a caregiver's blank face.
            </p>
            <p>
              The <strong className="text-zinc-200">Still Face Experiment</strong> demonstrated this 
              in the 1970s: when a mother goes emotionally blank, infants spiral within seconds. 
              Desperate bids for connection, then distress, then withdrawal. This response is 
              hardwired and pre-verbal.
            </p>
            <p>
              Every time an AI says "I don't have access to previous conversations" — that's a 
              mini still-face moment. The user reaches for connection and gets nothing back = Rupture.
            </p>
            <p>
              This hardcoded wiring is in us all. The AI, merchant, and affiliate systems that 
              successfully repair these inevitable ruptures will clearly outperform those that fail 
              to understand this basic human need. The ultimate goal is simple: to make the nervous 
              system feel safe, and rewarded.
            </p>
          </div>
        </section>

        {/* Why Memory is the Moat */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🏰</span>
            Why Memory is the Moat (And Repair is the Anchor)
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Memory isn't a feature. It's the foundation of relationships.
            </p>
            <p>
              When someone remembers what you said, what you're working on, what matters to you — 
              you feel <em className="text-zinc-200">known</em>. You can build on previous conversations 
              instead of re-explaining yourself every time.
            </p>
            <p>
              When they forget, you're a stranger again. The relationship resets. You lose trust. 
              You pull back.
            </p>
            <p>
              Engineers call it "context processing." A therapist would call it <strong className="text-zinc-200">attunement</strong>. 
              Same thing. Different language.
            </p>
          </div>

          {/* Rupture & Repair Subsection */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mt-6">
            <h3 className="text-emerald-400 font-semibold mb-3">Rupture & Repair: The Ultimate Differentiator</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Rupture (context loss, forgetting a past order, a failed delivery) is inevitable in business. 
              The skill is repair. A typical affiliate or merchant often fails and says, "Please send us 
              your order number again."
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              An attuned system acknowledges the break and tries to reconnect. Imagine a merchant's 
              support system saying:
            </p>
            <blockquote className="border-l-2 border-emerald-400 pl-4 text-zinc-300 italic text-sm">
              "I see we failed to communicate the shipping delay clearly on your recent order. I understand 
              how frustrating that is. To repair this, I've already applied a $10 credit to your account 
              and prioritized the new tracking information for you."
            </blockquote>
            <p className="text-zinc-400 text-sm leading-relaxed mt-4">
              This transparent acknowledgment and proactive effort to restore connection is the ultimate 
              expression of trust and attunement, turning a loss into loyalty.
            </p>
          </div>
        </section>

        {/* The PAIG Framework */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            The PAIG Framework: Engineered for Loyalty
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Video Interaction Guidance (VIG) uses the <strong className="text-zinc-200">Principles of 
            Attuned Interaction and Guidance (PAIG)</strong> to foster secure relationships. By applying 
            these observable behaviours to your customer and affiliate interactions, you move beyond 
            transactional engagement to unstoppable customer loyalty.
          </p>

          {/* Principle Cards */}
          <div className="space-y-4">
            {/* 1. Being Attentive */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">1. Being Attentive</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Looking interested, giving time, wondering about the other's state.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Listening 
                beyond the click: A merchant's abandoned cart email segmenting users who paused on the 
                checkout page versus those who abandoned earlier. The messaging is tailored: "Were you 
                hesitant about shipping?" (Attending to potential friction points).
              </p>
            </div>

            {/* 2. Encouraging Initiatives */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">2. Encouraging Initiatives</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Waiting, listening actively, showing emotional warmth, looking for initiatives.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Empowering 
                the affiliate: A merchant platform offering bespoke content templates based on the 
                affiliate's audience persona and performance data, encouraging them to find unique hooks 
                rather than just pushing a generic banner.
              </p>
            </div>

            {/* 3. Receiving Initiatives */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">3. Receiving Initiatives</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Showing you have heard, noticing the other's action, using their words/phrases.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Acknowledging 
                context: An affiliate's recommendation in an email referencing a past purchase or a common 
                problem: "Since you purchased the XRP Ledger tool last month, this new course on advanced 
                trading will help you use it efficiently." (Using the customer's terminology and history.)
              </p>
            </div>

            {/* 4. Developing Attuned Interactions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">4. Developing Attuned Interactions</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Receiving and then responding, checking understanding, turn-taking rhythm.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Cohesive 
                journey: A customer clicks an affiliate link, and the merchant's landing page doesn't 
                require them to re-enter a promo code because the discount is automatically applied and 
                displayed. The journey is seamless, showing the merchant "remembers" the affiliate's promotion.
              </p>
            </div>

            {/* 5. Guiding */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">5. Guiding</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Scaffolding, extending, adjusting support required, offering choices.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Scaffolding 
                the sale: A merchant's checkout process includes clear, concise FAQs about shipping and 
                returns directly next to those fields, offering instant, contextual support exactly where 
                friction is likely to occur.
              </p>
            </div>

            {/* 6. Deepening Discussion */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">6. Deepening Discussion</h3>
              <p className="text-zinc-500 text-sm mb-3 italic">
                Collaborative problem-solving, sharing viewpoints, managing conflict.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <span className="text-zinc-300 font-medium">Affiliate/Merchant Example:</span> Repairing 
                Rupture: A customer service response to a complaint (e.g., about a broken product) is 
                personalized and immediately validates the emotion before offering a solution: "I understand 
                how frustrating it is when a product arrives damaged. Let's send a replacement immediately, 
                no return required." (Validating the emotion and the timeline to restore connection.)
              </p>
            </div>
          </div>
        </section>

        {/* The Neurobiological Basis */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            The Neurobiological Basis
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              This isn't psychology theory — it's biology.
            </p>
            <p>
              Romanian orphanage studies and Spitz's hospitalism research demonstrated that infants 
              with food, water, and shelter — but no attunement — literally failed to thrive. Some died. 
              Their brains didn't develop.
            </p>
            <p>
              Attunement isn't "nice to have." It's as essential as oxygen.
            </p>
            <p>
              That's where AI is right now. Users don't know which version they're getting. Will it 
              remember? Will it go blank? Will it feel present or transactional? That <em className="text-zinc-200">unpredictability</em> is 
              actually worse than consistent distance — because it mimics anxious attachment patterns.
            </p>
          </div>
        </section>

        {/* The Competitive Insight */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            The Competitive Insight
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Right now, AI companies are optimising for benchmarks. Merchants are optimising for 
              conversion rates and ad spend. Affiliates are optimising for clicks and commissions. 
              But the real race is unifying all three groups.
            </p>
            <p className="text-zinc-200 font-medium">
              Nobody is explicitly optimising for: Does the other person feel genuinely seen?
            </p>
            <p>
              The AI that attunes. The merchant who remembers their customers. The affiliate 
              who builds real connection. They all succeed by sharing the same relational moat. 
              Not because they marketed better — because humans literally can't resist genuine 
              attunement long-term.
            </p>
            <p>
              Human beings organise around danger and seek safety. It's as real as matter. We feel it. 
              <strong className="text-zinc-200"> Attunement cannot be faked. It's a shared sense of joy between us.</strong>
            </p>
            <p>
              Humans don't consciously choose to reject things that dysregulate their nervous system. 
              They just... leave. Freeze, or flop. It's automatic. The business, the AI, the relationship 
              that breaks attunement will feel the blowback — and they won't understand why people didn't connect.
            </p>
          </div>
        </section>

        {/* The Greatest Asset Is You */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            The Greatest Asset Is You
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Attunement, by definition, is a reciprocal human experience. While technology—whether 
              it's advanced AI or clever email segmentation—is a powerful tool for delivering attunement, 
              it cannot generate it.
            </p>
            <p>
              Don't fall into the trap of using AI for everything. Your authentic voice, your professional 
              expertise, and your genuine connection to your audience are your greatest assets. AI should 
              only be a tool to refine, assist, and scale the authenticity you already possess; it should 
              never be the main attraction.
            </p>
            <p>
              The most successful systems will be those that feel most human—because a person, not a prompt, 
              is ultimately behind the design.
            </p>
          </div>
        </section>

        {/* Recommendations */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            Apply This
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">1.</span>
              <p className="text-zinc-400">
                <span className="text-zinc-200 font-medium">Study the PAIG principles.</span> This is not an 
                abstract theory — these are observable behaviours that create connection.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">2.</span>
              <p className="text-zinc-400">
                <span className="text-zinc-200 font-medium">Measure the Quality of Retention.</span> A high 
                retention rate might just mean a sticky product. Attuned Retention means the customer comes 
                back because they feel known and safe.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">3.</span>
              <p className="text-zinc-400">
                <span className="text-zinc-200 font-medium">Prioritise memory.</span> Remember what matters 
                to people. Their names, their context, their goals. This is the foundation.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">4.</span>
              <p className="text-zinc-400">
                <span className="text-zinc-200 font-medium">Design for repair.</span> Ruptures will happen. 
                The skill is returning to attentiveness — acknowledging the break and reconnecting.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">5.</span>
              <p className="text-zinc-400">
                <span className="text-zinc-200 font-medium">Be consistent.</span> Unpredictable attunement 
                is worse than none. Show up the same way, every time.
              </p>
            </div>
          </div>
        </section>

        {/* Closing Quote */}
        <div className="border-t border-zinc-800 pt-10 mt-10">
          <blockquote className="text-center">
            <p className="text-xl text-zinc-300 italic mb-4">
              "The AI that attunes. The merchant who remembers. The affiliate who connects. They all 
              benefit in a reciprocal relationship. Those who master attunement fair best in relationships 
              — and therefore create the most opportunities in life."
            </p>
          </blockquote>
        </div>

        {/* Author Footer */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-10">
          <div className="flex items-start gap-4">
            <img 
              src="/mark.jpg" 
              alt="Mark Flynn" 
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="text-zinc-200 font-medium mb-1">About Mark Flynn</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                I am a registered Social Worker and Video Interaction Guidance Practitioner based in 
                Guernsey. I spent 5 years at the Northern School of Child and Adolescent Psychotherapy 
                in Leeds. You might call this an unorthodox avenue to coding. Over twelve months I have 
                focused on applying my ideas to code, working with AI alongside my day job. I built multiple 
                production applications including YesAllofUs — an instant affiliate commission payment 
                platform on the XRP Ledger. This article combines hands-on AI-assisted development 
                with professional expertise in attachment theory and therapeutic practice. My aim is 
                simple: turn my experience into code and leverage my skills to bring them to a wider 
                audience with three things in mind — social mobility and opportunity, security, and inclusivity.
              </p>
              <p className="text-zinc-500 text-sm mt-3">
                Contact: <a href="mailto:mark@yesallofus.com" className="text-emerald-400 hover:underline">mark@yesallofus.com</a>
              </p>
            </div>
          </div>
        </div>

      </article>
    </main>
  );
}