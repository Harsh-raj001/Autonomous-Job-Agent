import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background mt-auto flex-shrink-0">
      {/* Subtle top divider with soft gradient */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 py-12 lg:py-16 flex flex-col items-center justify-center text-center">
        
        {/* Primary Text */}
        <p className="text-muted-foreground text-sm font-medium mb-3">
          Designed & Developed by{" "}
          <a
            href="https://linkedin.com/in/harsh-raj-in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-foreground font-semibold group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm"
            aria-label="Harsh Raj's LinkedIn Profile"
          >
            <span className="relative">
              Harsh Raj
              {/* Animated underline */}
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-indigo-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[250ms] ease-out rounded-full" />
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-[250ms] ease-out text-indigo-500" />
          </a>
        </p>

        {/* Secondary Text */}
        <p className="text-xs text-muted-foreground/70 mb-8 tracking-wide uppercase font-semibold">
          Product Strategy | Design | Development
        </p>

        {/* Contact Links */}
        <nav aria-label="Footer Navigation">
          <ul className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
            <li>
              <a
                href="https://github.com/Harsh-raj001"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm px-1"
              >
                GitHub
              </a>
            </li>
            <li className="text-muted-foreground/40" aria-hidden="true">•</li>
            <li>
              <a
                href="https://linkedin.com/in/harsh-raj-in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm px-1"
              >
                LinkedIn
              </a>
            </li>
            <li className="text-muted-foreground/40" aria-hidden="true">•</li>
            <li>
              <a
                href="mailto:harshraj1936@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm px-1"
              >
                Email
              </a>
            </li>
          </ul>
        </nav>

      </div>
    </footer>
  );
}
