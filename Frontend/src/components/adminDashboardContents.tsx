import React from 'react';
import { AdminBarChart } from '../components/ui/barChart';
import {CircleChart} from '../components/ui/CircleChart';
import {AdminLineChart} from '../components/ui/LineChart';
import {AdminAreaChart} from '../components/ui/AreaChart';
const AdminDashboardContents: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-8">
            <h1 className="text-xl font-bold">Welcome, Doctor !</h1>
            <p className="text-muted-foreground">
                Manage your Patients.
            </p>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className=""><AdminAreaChart/></div>
                <div className=""><AdminLineChart/></div>
                <div className=""><CircleChart/></div>
            </div>
            <div className=""><AdminBarChart/></div>
        </div>
    );
};

export default AdminDashboardContents;