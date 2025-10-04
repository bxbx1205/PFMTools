"use client"

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
	{ label: 'Features', href: '#features' },
	{ label: 'How it works', href: '#how-it-works' },
	{ label: 'Integrations', href: '#integrations' },
	{ label: 'Testimonials', href: '#testimonials' }
]

const featureHighlights = [
	{
		icon: '💹',
		title: 'Predictive Insights',
		description:
			'Anticipate cash flow and risk with AI-driven forecasting that adapts to your actual transaction history.',
		accent: 'from-emerald-400/20 via-emerald-500/10 to-transparent border-emerald-400/40'
	},
	{
		icon: '⚙️',
		title: 'Automated Workflows',
		description:
			'Replace repetitive reconciliations with smart rules, approvals, and alerts tailored to your team.',
		accent: 'from-violet-400/20 via-violet-500/10 to-transparent border-violet-400/40'
	},
	{
		icon: '📊',
		title: 'Executive Dashboards',
		description:
			'Deliver board-ready visuals, granular drill downs, and scheduled briefings in a single click.',
		accent: 'from-cyan-400/20 via-cyan-500/10 to-transparent border-cyan-400/40'
	}
]

const stats = [
	{ label: 'Finance teams onboarded', value: '2,500+' },
	{ label: 'Hours saved monthly', value: '120k' },
	{ label: 'Automated transactions', value: '48M' },
	{ label: 'Average ROI in year one', value: '312%' }
]

const workflowSteps = [
	{
		title: 'Connect & Consolidate',
		description:
			'Securely connect banking, ERP, payroll, and revenue tools in minutes with enterprise-grade encryption.'
	},
	{
		title: 'Automate Controls',
		description:
			'Configure approval paths, anomaly detection, and smart nudges that ensure compliance without the friction.'
	},
	{
		title: 'Deliver Clarity',
		description:
			'Turn complicated spreadsheets into live dashboards and reports your leadership can act on instantly.'
	}
]

const integrations = [
	'QuickBooks',
	'Zoho Books',
	'Xero',
	'Tally',
	'Stripe',
	'Razorpay',
	'SAP',
	'Oracle NetSuite'
]

const testimonials = [
	{
		quote:
			'PFMTools replaced five disconnected spreadsheets and helped us surface insights we previously missed. Our weekly finance sync now finishes in 25 minutes instead of 90.',
		name: 'Priya S.',
		role: 'Head of Finance, WorkFlowy'
	},
	{
		quote:
			'The automation rules are a game-changer. We caught a mismatch in vendor payouts in real time and prevented a major loss.',
		name: 'Rahul D.',
		role: 'Controller, Stellar Labs'
	}
]

const pricingTiers = [
	{
		id: 'growth',
		badge: 'Most popular',
		price: '₹7,900',
		cadence: 'per month',
		description: 'Built for modern finance teams moving fast and scaling globally.',
		perks: [
			'Unlimited bank and ledger connections',
			'AI-powered reconciliation and anomaly detection',
			'Collaborative workspaces with granular permissions',
			'Scheduled PDF, CSV, and Slack exports'
		]
	},
	{
		id: 'enterprise',
		badge: 'Enterprise',
		price: 'Let’s talk',
		cadence: 'custom pricing',
		description: 'For highly regulated organizations requiring bespoke workflows and support.',
		perks: [
			'Dedicated success architect and 24/7 support',
			'On-premise & private cloud deployment options',
			'Advanced audit trails with immutable logging',
			'Custom integrations and compliance reporting'
		]
	}
]

export default function Landing() {
	const [activeTier, setActiveTier] = useState('growth')

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-32 right-20 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-violet-500/40 via-sky-500/20 to-transparent blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/30 via-emerald-400/10 to-transparent blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,_163,_184,_0.15)_0%,_rgba(15,_23,_42,_0.9)_55%,_rgba(2,_6,_23,_1)_80%)]" />
			</div>

			<header className="relative z-10 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
					<div className="flex items-center space-x-2">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 text-xl font-bold">
							PF
						</div>
						<span className="text-lg font-semibold tracking-wide text-slate-100">PFMTools</span>
					</div>

					<nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className="transition hover:text-white">
								{link.label}
							</Link>
						))}
					</nav>

					<div className="flex items-center gap-3">
						<Link
							href="/login"
							className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/30 hover:text-white md:inline-flex"
						>
							Sign in
						</Link>
						<Link
							href="/signup"
							className="rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] transition hover:shadow-[0_14px_40px_rgba(56,189,248,0.45)]"
						>
							Start free trial
						</Link>
					</div>
				</div>
			</header>

			<main className="relative z-10">
				<section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center lg:text-left">
					<div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
								Finance teams ❤️ PFMTools
							</div>
							<h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
								The unified command center for modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-sky-400 to-cyan-300">finance operations</span>.
							</h1>
							<p className="mt-6 max-w-2xl text-lg text-slate-300">
								Close your books 5× faster, eliminate spreadsheet chaos, and surface actionable insights for leadership. PFMTools brings real-time dashboards, automation, and collaboration into one beautiful workspace.
							</p>
							<div className="mt-8 flex flex-wrap items-center gap-4">
								<Link
									href="/signup"
									className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 px-6 py-3 text-base font-semibold text-white shadow-[0_12px_45px_rgba(192,132,252,0.35)] transition hover:shadow-[0_18px_55px_rgba(192,132,252,0.45)]"
								>
									Create your workspace
								</Link>
								<Link href="#features" className="text-base font-semibold text-slate-200 transition hover:text-white">
									Explore the platform →
								</Link>
							</div>
							<dl className="mt-12 grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-left sm:grid-cols-4">
								{stats.map((stat) => (
									<div key={stat.label}>
										<dt className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</dt>
										<dd className="mt-2 text-2xl font-semibold text-white">{stat.value}</dd>
									</div>
								))}
							</dl>
						</div>

						<div className="relative hidden h-full rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl lg:flex lg:flex-col">
							<div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-white/20 via-transparent to-transparent blur-xl" />
							<div className="relative flex flex-1 flex-col rounded-2xl bg-slate-900/70 p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-widest text-slate-400">Live snapshot</p>
										<p className="mt-1 text-lg font-semibold text-white">Cash runway</p>
									</div>
									<span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">+12.4%</span>
								</div>
								<div className="mt-8 h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
									<div className="grid grid-cols-5 gap-3 text-xs text-slate-400">
										{[...Array(10)].map((_, idx) => (
											<div key={idx} className="col-span-1 flex flex-col items-center gap-2">
												<span className="text-[10px]">Q{idx + 1}</span>
												<div className="flex h-24 w-3 items-end rounded-full bg-slate-800">
													<div
														className="w-full rounded-full bg-gradient-to-t from-violet-500 to-sky-400"
														style={{ height: `${35 + Math.random() * 60}%` }}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
								<div className="mt-8 grid grid-cols-2 gap-3 text-sm">
									<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
										<p className="text-xs text-slate-400">Forecast variance</p>
										<p className="mt-1 text-lg font-semibold text-white">-1.3%</p>
										<p className="mt-2 text-xs text-emerald-300">Improved accuracy week over week</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
										<p className="text-xs text-slate-400">Outstanding approvals</p>
										<p className="mt-1 text-lg font-semibold text-white">3</p>
										<p className="mt-2 text-xs text-slate-400">Auto-reminders scheduled for today</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="features" className="mx-auto max-w-6xl px-6 pb-24">
					<div className="mx-auto text-center">
						<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
							Platform pillars
						</span>
						<h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
							Built for clarity, control, and confident decisions
						</h2>
						<p className="mt-4 text-base text-slate-400 sm:text-lg">
							Explain finance like a product roadmap—every stakeholder gets a real-time lens into what matters.
						</p>
					</div>
					<div className="mt-14 grid gap-8 md:grid-cols-3">
						{featureHighlights.map((feature) => (
							<div
								key={feature.title}
								className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${feature.accent} p-8 transition duration-300 hover:-translate-y-1 hover:border-white/20`}
							>
								<div className="absolute inset-x-8 -top-24 h-48 rounded-full bg-white/10 blur-3xl transition duration-300 group-hover:bg-white/20" />
								<div className="relative text-4xl">{feature.icon}</div>
								<h3 className="relative mt-6 text-2xl font-semibold text-white">{feature.title}</h3>
								<p className="relative mt-4 text-sm text-slate-200">{feature.description}</p>
								<div className="relative mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
								<p className="relative mt-4 text-sm font-semibold text-slate-100">Explore capability →</p>
							</div>
						))}
					</div>
				</section>

				<section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-24">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl">
						<div className="grid gap-10 lg:grid-cols-[0.55fr_1fr]">
							<div>
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
									Workflow
								</span>
								<h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Your 30-day implementation plan</h2>
								<p className="mt-4 text-base text-slate-400">
									We onboard your data, set up automation, and train your team to become PFMTools power users in record time.
								</p>
								<Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100">
									Talk to an implementation specialist →
								</Link>
							</div>
							<ol className="space-y-6">
								{workflowSteps.map((step, index) => (
									<li key={step.title} className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6">
										<span className="absolute -left-9 top-6 hidden h-16 w-0.5 bg-gradient-to-b from-white/40 to-transparent lg:block" />
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold text-cyan-300">Step {index + 1}</span>
											<span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">~ Week {index + 1}</span>
										</div>
										<h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
										<p className="mt-3 text-sm text-slate-300">{step.description}</p>
									</li>
								))}
							</ol>
						</div>
					</div>
				</section>

				<section id="integrations" className="mx-auto max-w-6xl px-6 pb-24">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-10">
						<div className="flex flex-wrap items-center justify-between gap-6">
							<div>
								<h2 className="text-3xl font-semibold text-white sm:text-4xl">Connect to the tools you already use</h2>
								<p className="mt-3 max-w-xl text-sm text-slate-400">
									PFMTools slots neatly into your existing finance stack—no painful rewiring required.
								</p>
							</div>
							<Link href="/integrations" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/40 hover:text-white">
								View all integrations
							</Link>
						</div>
						<div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
							{integrations.map((integration) => (
								<div key={integration} className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-sm font-semibold text-slate-200">
									{integration}
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="testimonials" className="mx-auto max-w-6xl px-6 pb-24">
					<div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr]">
						<div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-slate-900 to-slate-950 p-10">
							<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100">
								Testimonials
							</span>
							<h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Finance leaders who rely on PFMTools</h2>
							<p className="mt-4 max-w-xl text-sm text-slate-200">
								From high-growth startups to global enterprises, teams choose us to unify financial intelligence and execution.
							</p>
							<div className="mt-10 space-y-8">
								{testimonials.map((testimonial) => (
									<blockquote key={testimonial.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
										<p className="text-sm text-slate-100">“{testimonial.quote}”</p>
										<footer className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
											{testimonial.name} · {testimonial.role}
										</footer>
									</blockquote>
								))}
							</div>
						</div>
						<div className="space-y-6">
							<div className="rounded-3xl border border-white/10 bg-white/5 p-6">
								<p className="text-xs uppercase tracking-[0.35em] text-slate-300">Security & trust</p>
								<h3 className="mt-4 text-lg font-semibold text-white">Compliance baked in from day one</h3>
								<ul className="mt-4 space-y-3 text-sm text-slate-200">
									<li>• SOC2 Type II and ISO 27001 certified infrastructure</li>
									<li>• End-to-end encryption with regional data residency</li>
									<li>• Granular access controls, SSO, and audit logs</li>
								</ul>
							</div>

							<div className="rounded-3xl border border-white/10 bg-white/5 p-6">
								<p className="text-xs uppercase tracking-[0.35em] text-slate-300">Support</p>
								<h3 className="mt-4 text-lg font-semibold text-white">A partner, not just a platform</h3>
								<p className="mt-3 text-sm text-slate-200">
									Dedicated finance specialists, live training, and a library of resources to help your team ship value faster.
								</p>
								<Link href="/resources" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100">
									Browse resource library →
								</Link>
							</div>
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-6 pb-24">
					<div className="rounded-3xl border border-white/10 bg-white/5 p-10">
						<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
									Pricing
								</span>
								<h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Choose a plan that grows with you</h2>
								<p className="mt-3 max-w-xl text-sm text-slate-400">
									Start with a guided trial, then upgrade when your team is ready. Switch plans or cancel any time.
								</p>
							</div>
							<div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 p-2 text-xs font-semibold text-slate-200">
								{pricingTiers.map((tier) => (
									<button
										key={tier.id}
										onClick={() => setActiveTier(tier.id)}
										className={`rounded-full px-4 py-2 transition ${
											activeTier === tier.id
												? 'bg-gradient-to-r from-violet-500 via-sky-500 to-cyan-400 text-white shadow-[0_8px_25px_rgba(56,189,248,0.35)]'
												: 'hover:text-white'
										}`}
									>
										{tier.badge}
									</button>
								))}
							</div>
						</div>

						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{pricingTiers.map((tier) => (
								<div
									key={tier.id}
									className={`rounded-3xl border p-8 transition ${
										activeTier === tier.id
											? 'border-white/30 bg-gradient-to-br from-violet-500/20 via-sky-500/10 to-transparent'
											: 'border-white/10 bg-white/5 hover:border-white/20'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">{tier.badge}</span>
										<span className="text-3xl font-semibold text-white">{tier.price}</span>
									</div>
									<p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{tier.cadence}</p>
									<p className="mt-4 text-sm text-slate-200">{tier.description}</p>
									<ul className="mt-6 space-y-3 text-sm text-slate-100">
										{tier.perks.map((perk) => (
											<li key={perk}>• {perk}</li>
										))}
									</ul>
									<Link
										href="/signup"
										className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
									>
										{tier.id === 'growth' ? 'Start 14-day trial' : 'Chat with sales'}
									</Link>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto max-w-4xl px-6 pb-24">
					<div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600 via-slate-900 to-slate-950 p-10 text-center shadow-[0_30px_80px_rgba(59,130,246,0.25)]">
						<h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to transform finance from a cost center into a strategic advantage?</h2>
						<p className="mt-4 text-base text-slate-200">
							Start your personalized demo today. We’ll map your workflows, import data, and help you ship your first executive report in under a week.
						</p>
						<div className="mt-8 flex flex-wrap justify-center gap-4">
							<Link
								href="/signup"
								className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
							>
								Book live demo
							</Link>
							<Link href="/contact" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40">
								Talk to an expert
							</Link>
						</div>
					</div>
				</section>
			</main>

			<footer className="relative z-10 border-t border-white/5 bg-slate-950/80 py-10">
				<div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:text-left">
					<div>
						<span className="text-base font-semibold text-white">PFMTools</span>
						<p className="mt-2 max-w-xs text-xs text-slate-500">
							Finance intelligence designed for teams that want speed, accuracy, and strategic impact.
						</p>
					</div>
					<div className="flex flex-wrap justify-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						<Link href="/privacy" className="hover:text-slate-200">
							Privacy
						</Link>
						<Link href="/terms" className="hover:text-slate-200">
							Terms
						</Link>
						<Link href="/security" className="hover:text-slate-200">
							Security
						</Link>
						<Link href="/contact" className="hover:text-slate-200">
							Contact
						</Link>
					</div>
					<p className="text-xs text-slate-600">© {new Date().getFullYear()} PFMTools. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
