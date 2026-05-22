import { LangProvider } from '@/lib/i18n'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Ticker from '@/components/sections/Ticker'
import About from '@/components/sections/About'
import FeaturedTreatments from '@/components/sections/FeaturedTreatments'
import Booking from '@/components/sections/Booking'
import Gallery from '@/components/sections/Gallery'
import Testimonials from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <About />
        <FeaturedTreatments />
        <Booking />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  )
}
