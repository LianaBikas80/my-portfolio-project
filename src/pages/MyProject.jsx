import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

function MyProject() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("خطا در دریافت پروژه‌ها از سرور");
      }
    };

    fetchProjects();
  }, []);

  const filters = [
    { id: "All", label: t("projects.filters.all") || "همه" },
    { id: "React", label: t("projects.filters.react") || "React" },
    { id: "JavaScript", label: t("projects.filters.javascript") || "JavaScript" },
    { id: "Full Stack", label: "Full Stack" },
  ];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <section className="min-h-screen bg-slate-50 py-16 transition-colors duration-300 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* هدر بخش پروژه‌ها با انیمیشن ورود */}
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up [animation-duration:1.2s]">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            {t("projects.title")}{" "}
            <span className="text-violet-600 dark:text-violet-400">
              {t("projects.titleAccent")}
            </span>
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
            {t("projects.description")}
          </p>
        </div>

        {/* فیلترها */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
                  : "bg-white text-slate-600 shadow-sm hover:text-violet-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-violet-400"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* خطا */}
        {error && (
          <div className="mt-12 text-center text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* لیست خالی */}
        {!error && filteredProjects.length === 0 && (
          <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
            <p>پروژه‌ای در این دسته‌بندی یافت نشد.</p>
          </div>
        )}

        {/* کارت‌ها */}
        {!error && filteredProjects.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project._id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative overflow-hidden">
                  {project.image ? (
                    <img
                      src={
                        project.image && !project.image.includes("via.placeholder.com")
                          ? project.image
                          : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%236366f1'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23ffffff'>Project Preview</text></svg>"
                      }
                      alt={project.title}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%236366f1'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23ffffff'>Project Preview</text></svg>";
                      }}
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 dark:from-slate-800 dark:to-slate-900 dark:text-violet-400">
                      <svg
                        className="h-16 w-16 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                  {project.category && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-violet-700 backdrop-blur dark:bg-slate-950/80 dark:text-violet-300">
                      {project.category}
                    </span>
                  )}
                </div>

                <div className="space-y-5 p-6">
                  <div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
  {t(project.title)}
</h2>

<p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
  {t(project.description)}
</p>
    
                  </div>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        {t("projects.viewDemo") || "مشاهده دمو"}
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href="https://github.com/LianaBikas80/my-portfolio-project.git"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-500 hover:text-violet-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:text-violet-400"
                      >
                        {t("projects.github") || "گیت‌هاب"}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyProject;