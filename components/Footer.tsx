import { GithubIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-background text-foreground">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 text-xs">
        <div>&copy; 2024 ShowMeDo. All rights reserved.</div>
        <a
          href="https://github.com/ilyaizen/showmedo-next"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:underline"
        >
          <GithubIcon className="h-5 w-5" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}
