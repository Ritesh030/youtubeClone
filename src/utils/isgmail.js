function isgmail(email) {
            return /^[^@]+@gmail\.com$/.test(email);
}

export {isgmail}