"use client"

import Image from "next/image"
import Link from "next/link"

const navLinks = [{ label: "Features", href: "#features" }]

const features = [
	{
		icon: "⚡",
		title: "Automation first",
		description: "Eliminate repetitive finance ops with ready-to-use approval flows and smart reminders."
	},
	{
		icon: "📈",
		title: "Real-time visibility",
		description: "Track cash, revenue, and spend in a single live dashboard that updates every minute."
	},
	{
		icon: "🤝",
		title: "Effortless collaboration",
		description: "Loop in founders, finance, and auditors without endless spreadsheets or email threads."
	}
]

const spotlight = [
	"Smart alerts for unusual transactions the moment they happen",
	"Ready-to-send investor snapshots with one click",
	"Enterprise-grade security with role-based access control"
]

export default function Landing() {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(165,180,252,0.35),_rgba(15,23,42,0.95))]" />

			<header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
				<Link href="/" className="flex items-center gap-3">
					<Image
						src="/pfmlogo.png"
						alt="PFM Tools logo"
						width={140}
						height={40}
						className="h-10 w-auto"
						priority
					/>
				</Link>
				<nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
					{navLinks.map((link) => (
						<Link key={link.href} href={link.href} className="transition hover:text-white">
							{link.label}
						</Link>
					))}
				</nav>
				<Link
					href="/login"
					className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
				>
					Sign in
				</Link>
			</header>

			<main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12">
				<div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
							Finance made calm
						</p>
						<h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
							Handle every rupee with confidence from one clean workspace
						</h1>
						<p className="mt-4 max-w-xl text-base text-slate-300">
							Our platform gives founders and finance teams a live pulse on cash, spend, and revenue—without spreadsheet chaos.
						</p>
						<Link
							href="/login"
							className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
						>
							Get started
							<span aria-hidden>→</span>
						</Link>

						<div id="features" className="mt-10 grid gap-4 text-left sm:grid-cols-2 md:grid-cols-3">
							{features.map((feature) => (
								<div
									key={feature.title}
									className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
								>
									<span className="text-2xl">{feature.icon}</span>
									<h3 className="mt-3 text-base font-semibold text-white">{feature.title}</h3>
									<p className="mt-2 text-xs text-slate-300">{feature.description}</p>
								</div>
							))}
						</div>
					</div>

					<div className="flex h-full items-center justify-center">
						<div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-left shadow-[0_25px_80px_rgba(59,130,246,0.2)]">
							<div className="pointer-events-none absolute -top-16 right-10 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
							<div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
							<div className="pointer-events-none absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl" />

							<div className="relative">
								<p className="text-xs uppercase tracking-[0.3em] text-slate-300">Straight from our users</p>
								<h2 className="mt-5 text-lg font-semibold text-white">“This platform feels like a finance co-pilot.”</h2>
								<p className="mt-2 text-xs text-slate-300">
									A subtle, focused overview of the wins our customers rave about—paired with calming color flares.
								</p>
								<ul className="mt-6 space-y-3 text-sm text-slate-100">
									{spotlight.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-1 text-cyan-300">✦</span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
