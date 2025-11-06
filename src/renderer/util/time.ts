import greeting from '@/renderer/assets/json/home_message.json';
import { steamStore } from '../pinia/store/steam';

export function localTimeState(): string {
  let template = '';
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) {
    template = greeting.early_morning;
  } else if (hour >= 8 && hour < 12) {
    template = greeting.morning;
  } else if (hour >= 12 && hour < 14) {
    template = greeting.noon;
  } else if (hour >= 14 && hour < 18) {
    template = greeting.afternoon;
  } else if (hour >= 18 && hour < 23) {
    template = greeting.night;
  } else {
    template = greeting.late_night;
  }
  return steamStore().name === ''
    ? template.replace(' {user} ', '')
    : template.replace(' {user} ', steamStore().name);
}
