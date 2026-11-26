import LandingHeader from '../components/landing/LandingHeader'
import LandingHero from '../components/landing/LandingHero'
import RoundStory from '../components/landing/RoundStory'
import FairRules from '../components/landing/FairRules'
import Faq from '../components/landing/Faq'
import LandingFooter from '../components/landing/LandingFooter'
import { AdireStrip } from '../components/brand/AdirePattern'

export default function Landing() {
  return (
    <div className="min-h-dvh">
      <LandingHeader />
      <LandingHero />
      <AdireStrip />
      <RoundStory />
      <FairRules />
      <Faq />
      <LandingFooter />
    </div>
  )
}
