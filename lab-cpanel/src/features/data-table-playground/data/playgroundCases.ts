export type PlaygroundCase = {
  id: string
  patient: string
  clinic: string
  appliance: string
  stage: string
  due: string
  status: 'On track' | 'Due today' | 'Needs attention'
}

export const playgroundCases: PlaygroundCase[] = [
  { id: 'OR-4821', patient: 'Yassin Farouk', clinic: 'Smile Studio', appliance: 'Clear aligners', stage: 'Quality check', due: 'Today', status: 'Due today' },
  { id: 'OR-4822', patient: 'Lina Samir', clinic: 'Adel Ortho', appliance: 'Retainer', stage: 'Production', due: 'Tomorrow', status: 'On track' },
  { id: 'OR-4823', patient: 'Mostafa Adel', clinic: 'Bright Dental', appliance: 'Palatal expander', stage: 'Design', due: '27 Sep', status: 'On track' },
  { id: 'OR-4824', patient: 'Habiba Tarek', clinic: 'Ezzat Clinic', appliance: 'Hawley', stage: 'Received', due: 'Yesterday', status: 'Needs attention' },
  { id: 'OR-4825', patient: 'Ziad Mansour', clinic: 'Smile Studio', appliance: 'Clear aligners', stage: 'Production', due: '28 Sep', status: 'On track' },
  { id: 'OR-4826', patient: 'Nour Emad', clinic: 'Bright Dental', appliance: 'Essix', stage: 'Ready to ship', due: '26 Sep', status: 'On track' },
  { id: 'OR-4827', patient: 'Mariam Tarek', clinic: 'Adel Ortho', appliance: 'Retainer', stage: 'Quality check', due: '30 Sep', status: 'On track' },
  { id: 'OR-4828', patient: 'Adam Nabil', clinic: 'Smile Studio', appliance: 'Clear aligners', stage: 'Design', due: 'Today', status: 'Due today' },
  { id: 'OR-4829', patient: 'Salma Fathy', clinic: 'Bright Dental', appliance: 'Hawley', stage: 'Production', due: '02 Oct', status: 'On track' },
]
