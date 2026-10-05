import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis,ResponsiveContainer } from 'recharts';




export default function IndexLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
       <LineChart data={data}>

       
      <CartesianGrid strokeDasharray="5 5" />
      <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()}/>
      <YAxis />
      <Line type="monotone" dataKey="rating" name="Rating" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
     
      <Legend verticalAlign="top" align="right" />
     
    </LineChart>
    
      
</ResponsiveContainer>
    
  );
}