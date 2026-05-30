export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0F]/80 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-white/50 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} AutoPaise. All rights reserved.</span>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Help
          </a>
        </div>
      </div>
    </footer>
  )
}
