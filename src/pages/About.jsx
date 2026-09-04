import teacherPlaceholder from "../assets/images/teacher-placeholder.jpg";
import { useLanguage } from "../context/LanguageContext";

function About() {
  const { t } = useLanguage();

  const skills = [
    { name: t("about.skills.html"), level: t("about.skills.htmlLevel"), progress: 90, color: "bg-orange-500" },
    { name: t("about.skills.css"), level: t("about.skills.cssLevel"), progress: 85, color: "bg-blue-500" },
    { name: t("about.skills.javascript"), level: t("about.skills.javascriptLevel"), progress: 80, color: "bg-yellow-500" },
    { name: t("about.skills.react"), level: t("about.skills.reactLevel"), progress: 75, color: "bg-cyan-500" },
    { name: t("about.skills.git"), level: t("about.skills.gitLevel"), progress: 70, color: "bg-slate-400 dark:bg-slate-300" },
  ];

  return (
    <section className="min-h-screen bg-slate-50 py-16 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-16 px-4 sm:px-6 lg:px-8">
        
        {/* کادر درباره من */}
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
          
          {/* عنوان دارای انیمیشن */}
          <h2 className="animate-fade-in-up text-3xl font-bold text-slate-900 dark:text-white">
            {t("about.title")}{" "}
            <span className="text-violet-600 dark:text-violet-400">{t("about.titleAccent")}</span>
          </h2>

          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t("about.description")}
          </p>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {t("about.skillsTitle")}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span>{skill.name}</span>
                    <span>{skill.level}</span>
                  </div>

                  {/* نوار پس‌زمینه با کنتراست اصلاح‌شده در Dark Mode */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800/80 ring-1 ring-slate-300/30 dark:ring-slate-700/50">
                    <div
                      className={`h-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* کادر راهنما و مدرس */}
        <div className="space-y-8 text-center">
          
          {/* عنوان دارای انیمیشن */}
          <h3 className="animate-fade-in-up text-2xl font-bold text-slate-900 dark:text-white">
            {t("about.mentorTitle")}
          </h3>

          <div className="inline-block text-left">
            <div className="group relative mx-auto max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-40 blur transition duration-300 group-hover:opacity-75" />
                  <img
                    src={teacherPlaceholder}
                    alt={t("about.mentorImageAlt")}
                    className="relative h-24 w-24 rounded-full border-2 border-white object-cover dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-4 text-center">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("about.mentorName")}
                </h4>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("about.mentorRole")}
                </p>

                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("about.mentorDescription")}
                </p>

                <a
                  href="https://www.hamiddev.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {t("about.mentorButton")}
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;