import LandingHeader from '../components/landing/LandingHeader'
import LandingHero from '../components/landing/LandingHero'
import HowItWorks from '../components/landing/HowItWorks'
import Features from '../components/landing/Features'
import Faq from '../components/landing/Faq'
import LandingFooter from '../components/landing/LandingFooter'

export default function Landing() {
  return (
    <div className="min-h-dvh scroll-smooth">
      <LandingHeader />
      <div>
        <LandingHero />
        <HowItWorks />
        <Features />
        <Faq />
      </div>
      <LandingFooter />
    </div>
  )
}
