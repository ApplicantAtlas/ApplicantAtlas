import moment from 'moment';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@/store';
import { setPipelineConfiguration } from '@/store/slices/pipelineSlice';
import { PipelineConfiguration } from '@/types/models/Pipeline';
import { isZeroDate } from '@/utils/conversions';

interface ListPipelinesProps {
  pipelines: PipelineConfiguration[];
}

const ListPipelines = ({ pipelines }: ListPipelinesProps) => {
  const dispatch: AppDispatch = useDispatch();

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date ? moment(date).format('MMMM Do, YYYY') : '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-pin-rows table-pin-cols bg-white">
        <thead>
          <tr>
            <td>Name</td>
            <td>Last Updated At</td>
          </tr>
        </thead>
        <tbody>
          {pipelines.map((pipeline) => {
            let lastUpdatedAt = pipeline?.lastUpdatedAt;
            if (lastUpdatedAt && !isZeroDate(lastUpdatedAt)) {
              lastUpdatedAt = formatDate(new Date(lastUpdatedAt));
            } else {
              lastUpdatedAt = 'Unknown';
            }
            return (
              <tr
                key={pipeline.id}
                className="hover cursor-pointer"
                onClick={() => {
                  dispatch(setPipelineConfiguration(pipeline));
                }}
              >
                <td>{pipeline.name}</td>
                <td>{lastUpdatedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListPipelines;
