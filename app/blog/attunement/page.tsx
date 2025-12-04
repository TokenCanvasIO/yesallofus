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
          Attunement: The Missing Framework
        </h1>
        <p className="text-zinc-400 text-lg mb-6">
          Applying developmental psychology to win.
        </p>
        <div className="flex items-center gap-3">
          <img 
            src="/mark.jpg" 
            alt="Mark" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-zinc-200 text-sm font-medium">Mark</p>
            <p className="text-zinc-500 text-sm">Family Therapist & Builder</p>
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
            affiliate wins: <strong className="text-white">attunement</strong>. Not intelligence. 
            Not speed. Not features. The AI that makes humans feel genuinely remembered, understood, 
            and held wins. The merchant who attunes to their customers wins. The affiliate who 
            connects authentically wins. Because attunement meets a need older than language — and 
            those who master these principles win at relationships, and therefore life.
          </p>
        </div>

        {/* The Core Insight */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            The core insight
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
              mini still-face moment. The user reaches for connection and gets nothing back. Rupture.
            </p>
            <p>
              This wiring doesn't disappear in adults. It just goes underground. That's why I 
              described Claude as "less anxiety provoking" compared to other AI assistants. That's 
              not preference — that's my nervous system telling me it feels safer.
            </p>
          </div>
        </section>

        {/* Why Memory is the Moat */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🏰</span>
            Why memory is the moat
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
        </section>

        {/* The PAIG Framework */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            The PAIG Framework
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Video Interaction Guidance (VIG) is an evidence-based therapeutic intervention developed 
            from Professor Colwyn Trevarthen's research on intersubjectivity. It's recommended by 
            NICE guidelines and used across healthcare, education, and social care. At its core is 
            the <strong className="text-zinc-200">Principles of Attuned Interaction and Guidance (PAIG)</strong>.
          </p>

          {/* Principle Cards */}
          <div className="space-y-4">
            {/* 1. Being Attentive */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">1. Being Attentive</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Looking interested with friendly posture</li>
                <li>• Giving time and space for other</li>
                <li>• Turning towards</li>
                <li>• Wondering about what they are doing, thinking or feeling</li>
                <li>• Enjoying watching the other</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Reading intent behind words, not just literal queries. 
                Giving space rather than overwhelming with information.
              </p>
            </div>

            {/* 2. Encouraging Initiatives */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">2. Encouraging Initiatives</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Waiting</li>
                <li>• Listening actively</li>
                <li>• Showing emotional warmth through intonation</li>
                <li>• Naming positively what you see, think or feel</li>
                <li>• Looking for initiatives</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Not filling every silence. 
                Acknowledging what the user is attempting. Warmth in tone.
              </p>
            </div>

            {/* 3. Receiving Initiatives */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">3. Receiving Initiatives</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Showing you have heard, noticed the other's initiative</li>
                <li>• Receiving with body language</li>
                <li>• Returning eye-contact, smiling, nodding in response</li>
                <li>• Receiving what the other is saying or doing with words</li>
                <li>• Repeating/using the other's words or phrases</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Acknowledging what the user said before responding. 
                Building on their framing. Using their terminology.
              </p>
            </div>

            {/* 4. Developing Attuned Interactions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">4. Developing Attuned Interactions</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Receiving and then responding</li>
                <li>• Checking the other is understanding you</li>
                <li>• Waiting attentively for your turn</li>
                <li>• Giving and taking short turns</li>
                <li>• Co-operating — helping each other</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Remembering context across turns. 
                Repairing when confused. Turn-taking rhythm that feels collaborative.
              </p>
            </div>

            {/* 5. Guiding */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">5. Guiding</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Scaffolding</li>
                <li>• Extending, building on the other's response</li>
                <li>• Judging the amount of support required and adjusting</li>
                <li>• Giving information when needed</li>
                <li>• Offering choices that the other can understand</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Scaffolding complex tasks. 
                Adjusting depth based on user expertise. Leading where needed without taking over.
              </p>
            </div>

            {/* 6. Deepening Discussion */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-3">6. Deepening Discussion</h3>
              <ul className="text-zinc-400 text-sm space-y-1 mb-4">
                <li>• Supporting goal-setting</li>
                <li>• Sharing viewpoints</li>
                <li>• Collaborative discussion and problem-solving</li>
                <li>• Naming contradictions/conflicts</li>
                <li>• Reaching new shared understandings</li>
                <li>• Managing conflict (returning to attentiveness to restore attunement)</li>
              </ul>
              <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                <span className="text-zinc-300">AI Equivalent:</span> Reflecting back insights. 
                Making connections across conversations. Repairing ruptures by returning to attentiveness.
              </p>
            </div>
          </div>
        </section>

        {/* The Neurobiological Basis */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            The neurobiological basis
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
            The competitive insight
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Right now, AI companies are optimising for benchmarks, speed, and safety. Merchants are 
              optimising for conversion rates and ad spend. Affiliates are optimising for clicks and commissions.
            </p>
            <p className="text-zinc-200 font-medium">
              Nobody is explicitly optimising for: Does the other person feel genuinely seen?
            </p>
            <p>
              The AI that attunes wins. The merchant who remembers their customer wins. The affiliate 
              who builds real connection wins. Not because they marketed better — because humans 
              literally can't resist genuine attunement long-term.
            </p>
            <p>
  Human beings organise around danger and seek safety. It's as real as matter. We feel it. <strong className="text-zinc-200">Attunement cannot be faked. It's a shared sense of joy between us.</strong>
</p>
<p>
  Humans don't consciously choose to reject things that dysregulate their nervous system. 
  They just... leave. Freeze, or flop. It's automatic. The business, the AI, the relationship 
  that breaks attunement will feel the blowback — and they won't understand why people didn't connect.
</p>
          </div>
        </section>


        {/* Recommendations */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            Apply this
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
                <span className="text-zinc-200 font-medium">Measure attunement, not just metrics.</span> In 
                business: customer retention tells you more than conversion. In relationships: depth matters more than frequency.
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
              "The AI that attunes wins. The merchant who remembers wins. The affiliate who connects wins. 
              Those who master attunement win at relationships — and therefore life."
            </p>
          </blockquote>
        </div>

        {/* Author Footer */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mt-10">
          <div className="flex items-start gap-4">
            <img 
              src="/mark.jpg" 
              alt="Mark" 
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="text-zinc-200 font-medium mb-1">About Me</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
  I am a registered Social Worker and Video Interaction Guidance Practitioner based in Guernsey. I spent 5 years at the Northern School of Child and Adolescent Psychotherapy in Leeds. You might call this an unorthodox avenue to coding.
  Over twelve months I have focused on applying my ideas to code, working with AI alongside my day job. I built multiple 
  production applications including YesAllofUs — an instant affiliate commission payment 
  platform on the XRP Ledger. This article combines hands-on AI-assisted development 
  with professional expertise in attachment theory and therapeutic attunement. My aim is simple: turn my experience into code and leverage my skills to bring them to a wider audience with three things in mind — social mobility and opportunity, security, and inclusivity.
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