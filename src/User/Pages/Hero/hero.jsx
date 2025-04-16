import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./hero.module.css";

const hero = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const pages = [
    { id: 1, title: "Getting Started", icon: "📚", updatedAt: "Apr 12" },
    { id: 2, title: "Projects", icon: "📋", updatedAt: "Apr 14" },
    { id: 3, title: "Meeting Notes", icon: "📝", updatedAt: "Apr 15" },
    { id: 4, title: "Ideas", icon: "💡", updatedAt: "Apr 16" },
    { id: 5, title: "Reading List", icon: "📖", updatedAt: "Apr 10" },
  ];

  const widgets = [
    { id: 1, title: "Tasks", icon: "✓", count: "8 remaining" },
    { id: 2, title: "Notes", icon: "📝", count: "12 notes" },
    { id: 3, title: "Calendar", icon: "📅", count: "3 events today" },
  ];

  return (
    <motion.div
      className={styles.mainContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.contentWrapper}>
        <motion.h1
          className={styles.pageTitle}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          My Workspace
        </motion.h1>

        {/* Widgets Section */}
        <motion.div
          className={styles.section}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className={styles.widgetGrid}>
            {widgets.map((widget, index) => (
              <motion.div
                key={widget.id}
                className={styles.widget}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              >
                <div className={styles.widgetIconContainer}>
                  <span className={styles.widgetIcon}>{widget.icon}</span>
                </div>
                <div className={styles.widgetContent}>
                  <h3 className={styles.widgetTitle}>{widget.title}</h3>
                  <p className={styles.widgetCount}>{widget.count}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              className={`${styles.widget} ${styles.addWidget}`}
              whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className={styles.addWidgetContent}>
                <span className={styles.addWidgetIcon}>+</span>
                <p className={styles.addWidgetText}>Add Widget</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Pages Section */}
        <motion.div
          className={styles.section}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent pages</h2>
            <div className={styles.createButtonContainer}>
              <motion.button
                className={styles.createButton}
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.plusIcon}>+</span> New
              </motion.button>

              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div
                    className={styles.createMenu}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      className={styles.menuItem}
                      whileHover={{ backgroundColor: "#f5f5f5" }}
                    >
                      <span className={styles.menuItemIcon}>📄</span> Empty page
                    </motion.button>
                    <motion.button
                      className={styles.menuItem}
                      whileHover={{ backgroundColor: "#f5f5f5" }}
                    >
                      <span className={styles.menuItemIcon}>📝</span> Text note
                    </motion.button>
                    <motion.button
                      className={styles.menuItem}
                      whileHover={{ backgroundColor: "#f5f5f5" }}
                    >
                      <span className={styles.menuItemIcon}>✓</span> To-do list
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.pageGrid}>
            {pages.map((page, index) => (
              <motion.button
                key={page.id}
                className={styles.pageCard}
                whileHover={{ y: -4, boxShadow: "0 8px 15px rgba(0,0,0,0.05)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <div className={styles.pageIcon}>{page.icon}</div>
                <div className={styles.pageInfo}>
                  <h3 className={styles.pageName}>{page.title}</h3>
                  <p className={styles.pageDate}>Updated {page.updatedAt}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          className={styles.section}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>Getting started</h2>
          <div className={styles.resourceGrid}>
            {[
              {
                icon: "📚",
                title: "Documentation",
                desc: "Learn how to use the app",
              },
              { icon: "🎨", title: "Templates", desc: "Start with a template" },
              { icon: "🔄", title: "Import", desc: "Import your data" },
            ].map((resource, index) => (
              <motion.div
                key={index}
                className={styles.resourceCard}
                whileHover={{ y: -4, boxShadow: "0 8px 15px rgba(0,0,0,0.05)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              >
                <div className={styles.resourceIcon}>{resource.icon}</div>
                <h3 className={styles.resourceTitle}>{resource.title}</h3>
                <p className={styles.resourceDescription}>{resource.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default hero;
