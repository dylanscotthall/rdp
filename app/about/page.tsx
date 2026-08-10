import Link from "next/link";
import Image from "next/image";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* HERO */}
        <section
          className={`${styles.hero} ${styles.paperBox} border-blueprint`}
        >
          <div className={styles.heroContent}>
            <div className={styles.avatarWrap}>
              <Image
                src="https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/AnaliseFaceShot.JPG"
                alt="Photographer portrait"
                width={140}
                height={140}
                className={styles.avatar}
                priority
              />
            </div>

            <div className={styles.heroText}>
              <h1 className={styles.title}>About Me</h1>
              <p className={styles.lead}>
                Analise DuBose — Photo journalism and multimedia storytelling
                across ocean, field, and human experience
              </p>

              <div className={styles.ctaRow}>
                <Link href="/" className={styles.ctaButton}>
                  View Portfolio
                </Link>
                <Link href="/contact" className={styles.ctaSecondary}>
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BIO */}
        <section
          className={`${styles.section} ${styles.paperBox} border-blueprint`}
        >
          <h2 className={styles.sectionTitle}>Rude Dude Media</h2>
          <p className={styles.paragraph}>
            Rude Dude Media is an independent multimedia project founded and run
            by Analise DuBose, a Texas-based creative working across
            photography, cinematography/editing, color grading, scripting, and
            audio. Currently studying Integrated Studies (IS-3D) with a focus in
            sustainability, film, and journalism, the work centers on ocean
            culture, wildlife, sport, and human-centered stories. Projects
            include photojournalism, field reporting, documentary development,
            and high-energy visual media produced in real-world environments.
          </p>

          <p className={styles.paragraph}>
            I shoot on both film and digital, and I enjoy the process of
            combining analogue and digital workflows to achieve a timeless
            aesthetic. When I&apos;m not on a shoot you&apos;ll find me
            exploring coastal roads, brewing coffee, or sketching composition
            ideas in a notebook.
          </p>
        </section>

        {/* SERVICES & SKILLS */}
        <section className={`${styles.section} ${styles.grid}`}>
          <div className={`${styles.card} ${styles.paperBox} border-blueprint`}>
            <h3 className={styles.cardTitle}>Services</h3>
            <ul className={styles.list}>
              <li>Editorial & Commercial Photography</li>
              <li>Portraits & Headshots</li>
              <li>Events</li>
              <li>Video & Short-form Content</li>
              <li>Underwater Filming & Photography</li>
              <li>Surf Video & Photography</li>
            </ul>
          </div>

          <div className={`${styles.card} ${styles.paperBox} border-blueprint`}>
            <h3 className={styles.cardTitle}>Skills & Tools</h3>
            <ul className={styles.list}>
              <li>Film (35mm, medium format) & Digital</li>
              <li>Lighting: Natural, Strobes, Modifiers</li>
              <li>
                Post: Lightroom, DaVinci Resolve, Photoshop, Final Cut Pro
              </li>
              <li>Retouching & Color Grading</li>
              <li>Audio Engineering</li>
              <li>Scripting & Journalism</li>
            </ul>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section
          className={`${styles.section} ${styles.paperBox} ${styles.testimonials} border-blueprint`}
        >
          <h2 className={styles.sectionTitle}>Testimonials</h2>
          <div className={styles.testList}>
            <blockquote className={styles.quote}>
              &ldquo;Wow Analise, this is fantastic!!! Great job. I hope you are
              pleased with the results. I am so grateful you chose to shine your
              light on us. Your pictures and storytelling are a true gift. Thank
              you so much!!!&rdquo;{" "}
              <span className={styles.credit}>— Scott Walsh</span>
            </blockquote>

            <blockquote className={styles.quote}>
              &ldquo;I cannot say thank you enough! This is insane you did so
              good, I could not have pictured it better!&rdquo;{" "}
              <span className={styles.credit}>— Mad Shells</span>
            </blockquote>
          </div>
        </section>

        {/* QUICK CONTACT CTA */}
        <section
          className={`${styles.section} ${styles.paperBox} ${styles.contactStrip} border-blueprint`}
        >
          <h3 className={styles.stripTitle}>Ready to work together?</h3>
          <p className={styles.stripText}>
            For bookings, rates, or general enquiries — I reply within 48 hours.
          </p>
          <Link href="/contact" className={styles.stripButton}>
            Contact Me
          </Link>
        </section>
      </main>
    </div>
  );
}
