import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Image, MessageSquare, Home, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';

const Layout = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/branches', label: 'Branches', icon: Building2 },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/enquiries', label: 'Enquiries', icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              active
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col space-y-2 mt-6">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center">
              <Building2 className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-xl font-bold">Nyxta CMS</h1>
            </div>
          </div>

          {/* Desktop: Hostel Management System text */}
          <div className="hidden md:block text-sm text-muted-foreground">
            Hostel Management System
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-background min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
