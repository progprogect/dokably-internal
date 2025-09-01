import { useEffect } from 'react';

const usePrivateSurvey = (timeout = 60000) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const Intercom = Object(window).Intercom;
      const surveyDisabled = localStorage.getItem('surveyDisabled');
      if (Intercom && (!surveyDisabled || surveyDisabled != 'true')) {
        Intercom('startSurvey', 32423153);
        localStorage.setItem('surveyDisabled', 'true');
      }
    }, timeout);
    return () => {
      clearTimeout(timer);
    };
  }, []);
};

export default usePrivateSurvey;