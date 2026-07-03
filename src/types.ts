export type PluginProgressPayload = {
  score: number;
  completed: boolean;
};

export type PluginContext = {
  lectureId: string;
  grade: number;
  subject: string;
  reportProgress: (payload: PluginProgressPayload) => void;
};
