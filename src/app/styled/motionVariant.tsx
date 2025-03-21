export const btnVariants = {
    //--- Hover
    loginHover: {
        backgroundColor: "#007ce9",
        transition: { duration: 0.3 },
    },
    otherHover: {
        backgroundColor: "#f7f9fa",
        transition: { duration: 0.3 },
    },
    iconHover: {
        scale: 1.05,
        transition: {
            type: "spring",
            duration: 0.1,
            stiffness: 150,
            damping: 10
        },
    },

    //--- Click
    loginClick: {
        backgroundColor: "#2b9cff",
        transition: { duration: 0.3 },
    },
    otherClick: {
        backgroundColor: "#f5f8fa",
        transition: { duration: 0.3 },
    },
    iconClick: {
        scale: 0.95,
        opacity: 0.7,
        transition: {
            type: "spring",
            duration: 0.1,
            stiffness: 150,
            damping: 10
        },
    },

};