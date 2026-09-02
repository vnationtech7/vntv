import { PublicLayout } from "@/components/layout/public-layout";
import { Mail, Users, Target, Heart } from "lucide-react";

export const metadata = {
  title: "About Us - VNTV",
  description: "Learn about VNTV - Africa's premier digital news and video platform",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            About VNTV
          </h1>
          <p className="text-xl text-text-secondary">
            Africa. Our Stories. Our Way.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-vntv-red/10">
              <Target className="h-6 w-6 text-vntv-red" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Our Mission</h2>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-text-secondary leading-relaxed">
              VNTV is dedicated to delivering authentic African news and stories to a global audience. 
              We believe in the power of local narratives, told by Africans, for Africans and the world. 
              Our platform combines cutting-edge digital journalism with video storytelling to bring you 
              comprehensive coverage of news, politics, business, entertainment, and culture across the continent.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-vntv-red/10">
              <Heart className="h-6 w-6 text-vntv-red" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Our Vision</h2>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-text-secondary leading-relaxed">
              To be the leading digital media platform that amplifies African voices, celebrates our diverse 
              cultures, and shapes global conversations about Africa. We envision a world where African stories 
              are told with authenticity, nuance, and the respect they deserve.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-vntv-red/10">
              <Users className="h-6 w-6 text-vntv-red" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <h3 className="text-lg font-bold text-text-primary mb-2">Authenticity</h3>
              <p className="text-sm text-text-secondary">
                We tell African stories from an African perspective, ensuring accuracy and cultural sensitivity.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <h3 className="text-lg font-bold text-text-primary mb-2">Independence</h3>
              <p className="text-sm text-text-secondary">
                Our editorial integrity is paramount. We report without bias or external influence.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <h3 className="text-lg font-bold text-text-primary mb-2">Innovation</h3>
              <p className="text-sm text-text-secondary">
                We embrace new technologies and storytelling formats to engage modern audiences.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <h3 className="text-lg font-bold text-text-primary mb-2">Community</h3>
              <p className="text-sm text-text-secondary">
                We build connections, foster dialogue, and create a platform for diverse African voices.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-16 text-center border-t border-border pt-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-8 w-8 text-vntv-red" />
            <h2 className="text-2xl font-bold text-text-primary">Get in Touch</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Have questions or want to learn more about VNTV?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-vntv-red px-8 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-vntv-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vntv-red focus-visible:ring-offset-2"
          >
            Contact Us
          </a>
        </section>
      </div>
    </PublicLayout>
  );
}
