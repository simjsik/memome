export const btnVariants = {
    //--- Hover
    loginHover: {
        backgroundColor: "#007ce9",
        transition: { duration: 0.2 },
    },
    otherHover: {
        backgroundColor: "#f7f9fa",
        transition: { duration: 0.2 },
    },

    iconWrapHover: {
        backgroundColor : '#ebebf5',
        transition: { duration: 0.2, },
    },

    iconHover: {
        scale: 1.05,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },

    NtcHover: {
        backgroundColor: "#fff8f7",
        scale: 1.05,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },
    NtcOffHover: {
        backgroundColor: "#f7f9fa",
        scale: 1.05,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },

    //--- Click
    loginClick: {
        backgroundColor: "#2b9cff",
        transition: { duration: 0.2 },
    },
    otherClick: {
        backgroundColor: "#f5f8fa",
        transition: { duration: 0.2 },
    },
    iconWrapClick: {
        backgroundColor : '#e1e1eb',
        transition: { duration: 0.2, },
    },
    iconClick: {
        scale: 0.95,
        opacity: 0.7,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },

    NtcClick: {
        backgroundColor: "#ffd9d4",
        scale: 0.95,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },
    NtcOffClick: {
        backgroundColor: "#f5f8fa",
        scale: 0.95,
        transition: {
            type: "spring",
            duration: 0.2,
            stiffness: 150,
            damping: 10
        },
    },

};