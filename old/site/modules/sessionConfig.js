
// Setups :
const s = { days :        1,
            hours :       0,
            minutes :     15,
            seconds :     0,
            miliseconds : 0
}

const t = { ms_in_sec   : 1000,
    sec_in_min  : 60,
    min_in_hour : 60,
    hour_in_day : 24
}

module.exports = {
    salt: 'urz-tech-secret',
    cookieLifeTime: { 
        // Округление: малые значения отбрасываются
        inDays : 	   s.days,
        inHours:   	   s.days*t.hour_in_day + s.hours,
        inMinutes:     t.min_in_hour * (s.days*t.hour_in_day + s.hours) + s.minutes,
        inSeconds: 	   t.sec_in_min * (t.min_in_hour * (s.days*t.hour_in_day + s.hours) + s.minutes) + s.seconds,
        inMiliseconds: t.ms_in_sec * (t.sec_in_min * (t.min_in_hour * (s.days*t.hour_in_day + s.hours) + s.minutes) + s.seconds) + s.miliseconds ,

        days        : s.days,     
        hours       : s.hours,   
        minutes     : s.minutes,
        seconds     : s.seconds,
        miliseconds : s.miliseconds   
        
    }
// 7 days
};